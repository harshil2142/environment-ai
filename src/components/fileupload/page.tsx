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
    console.log("heloo jay");
    const payload = {
      imageUrl: data.imageUrl,
    };
    console.log(payload);
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
                const timestamp = new Date().getTime();
                const baseStripped = stripSpecialCharacters(basename);
                const filename = `${baseStripped}${extension}`;
                const s3urlname = `${process.env
                  .NEXT_PUBLIC_AWS_S3_BUCKET!}/pdf/${timestamp}/${filename}`;
                return s3urlname;
              }}
              acceptedFileTypes={["application/pdf"]}
              fileValidateTypeLabelExpectedTypes="Expects .pdf"
              maxFileSize="30MB"
              onRemoveComplete={({ name }: { name: any }) => {
                // Clear the image preview URL when removing the image
                // setImagePreviewUrl(null);
                props.setPdfDataUrl(null);
                return form.setValue("imageUrl", name);
              }}
              onUploadComplete={async ({ fileName }) => {
                let fileUrl = generateS3FileUrl({
                  s3BucketName: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
                  s3KeyName: fileName,
                });
                // Update the image preview URL
                // setImagePreviewUrl(fileUrl);
                // Set the image URL in the form
                props.setPdfDataUrl(fileUrl);
                const res = await postRequest({
                  url: "/history/get-summury",
                  data: { pdfUrl: fileUrl },
                });
                if (res?.data?.success) {
                  props.resetStateHndler();
                  props.setSummaryState(res?.data?.summury);
                }
                return form.setValue("imageUrl", fileUrl);
              }}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
