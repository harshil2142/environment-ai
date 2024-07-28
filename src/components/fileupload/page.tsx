"use client";

import { Form, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import FileUploader from "@/components/FileUploader";
import { stripSpecialCharacters } from "@/constants/constants";
import generateS3FileUrl from "@/constants/s3-url-generate";
import { Button } from "@/components/ui/button";
import { getRequest, postRequest } from "@/services/api";
import { useState } from "react";

export default function FileUpload(props: any) {
  const formSchema = z.object({
    imageUrl: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // console.log("heloo jay");
    const payload = {
      imageUrl: data.imageUrl,
    };
    // console.log(payload);
  }

  return (
    <div className="w-[300px] flex justify-center items-center flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2 xl:justify-start w-[300px]">
            <FileUploader
              bucket={process.env.NEXT_PUBLIC_AWS_S3_BUCKET!}
              fileRenameFunction={({
                basename,
                extension,
              }: {
                basename: any;
                extension: any;
              }) => {
                // console.log(basename, extension);
                const timestamp = new Date().getTime();
                const baseStripped = stripSpecialCharacters(basename);
                const filename = `${baseStripped}${extension}`;
                const s3urlname = `${timestamp}-${filename}`;
                return s3urlname;
              }}
              acceptedFileTypes={["application/pdf"]}
              fileValidateTypeLabelExpectedTypes="Expects .pdf"
              maxFileSize="30MB"
              onRemoveComplete={({ name }: { name: any }) => {
                // Clear the image preview URL when removing the image
                // setImagePreviewUrl(null);
                props.setPdfData((pre: any) => {
                  return pre.filter((item: any) => {
                    return Object.keys(item)[0] !== name;
                  });
                });
                props.setTotalFiles((pre: any) => Math.max(pre - 1, 0));
                props.setPdfDataUrl(null);
                return form.setValue("imageUrl", name);
              }}
              onUploadComplete={async ({ fileName, data }) => {
                props.setPdfData((pre: any) => {
                  return [...pre, { [fileName]: data }];
                });

                return form.setValue("imageUrl", fileName);
              }}
              handleAddFile={props.handleAddFile}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
