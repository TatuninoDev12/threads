'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import * as z from "zod";
import { CommentValidation } from "@/lib/validations/thread";
import { usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { addComment } from '@/lib/actions/thread.action';

interface Props {
    threadId: string
    currentUserImg: string
    currentUserId: string
}

const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {
    const pathname = usePathname();

    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addComment(
            threadId,
            values.thread,
            JSON.parse(currentUserId),
            pathname,
        );

        form.reset();
    };

    return (
        <Form {...form}>
            <form
                className='comment-form'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name='thread'
                    render={({ field }) => (
                        <FormItem className='flex w-full items-center gap-3'>
                            <FormLabel>
                                <img src={currentUserImg} alt="Profile image" width={48} height={48} className='rounded-full object-contain' />
                            </FormLabel>
                            <FormControl className='border-none bg-transparent'>
                                <Input type='text' placeholder='Comment...' className="no-focus text-light-1 outline-none" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type='submit' className='comment-form_btn'>
                    Reply
                </Button>
            </form>
        </Form>
    )
}

export default Comment