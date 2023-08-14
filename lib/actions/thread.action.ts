"use server";
import { auth } from "@clerk/nextjs";
import Thread from "../models/thread.model";
import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();
    const createThread = await Thread.create({
      text,
      author,
      community: null,
    });
    // update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createThread._id },
    });
    revalidatePath(path);
  } catch (err: any) {
    throw new Error(`Failed to create thread: ${err.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();
  //calculate the number of posts to skip
  const skips = (pageNumber - 1) * pageSize;
  // Fetch the posts that have no parents (top-leve threads)
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skips)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  const totalPosts = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });
  const posts = await postsQuery.exec();
  const isNext = totalPosts > skips + posts.length;

  return { posts, isNext };
}

export async function fetchThreadById(threadId: string) {
  connectToDB();
  try {
    // TODO: populate Community
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err: any) {
    throw new Error(`Failed to fetch thread: ${err.message}`);
  }
}

export async function addComment(
  threadId: string,
  comment: string,
  userId: string,
  path: string
) {
  connectToDB();
  try {
    //Find the original thread
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) throw new Error("Thread not found");

    //create a new thread with the comment text
    const commentThread = new Thread({
      text: comment,
      author: userId,
      parentId: threadId,
    });
    // Save the new thread
    const savedCommentThread = await commentThread.save();
    // Update the original thread to include the new comment
    originalThread.children.push(savedCommentThread._id);

    //save the original thread
    await originalThread.save();
    revalidatePath(path);
  } catch (err: any) {
    throw new Error(`Failed to add comment: ${err.message}`);
  }
}
