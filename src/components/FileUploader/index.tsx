// import FilePondPluginImageOverlay from 'filepond-plugin-image-overlay';
import AWS from "aws-sdk";
import FilePondPluginFileRename from "filepond-plugin-file-rename";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond-plugin-image-overlay/dist/filepond-plugin-image-overlay.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";
import { LegacyRef } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "./index.css";

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});

const Index: React.FC<IndexProps> = ({
  acl,
  bucket,
  error,
  existingFiles,
  fieldDesign,
  fileRenameFunction,
  acceptedFileTypes,
  fileValidateTypeLabelExpectedTypes,
  forwardRef,
  ref,
  maxFileSize,
  onRemoveComplete,
  onUploadComplete,
  ...props
}) => {
  if (typeof registerPlugin === "function") {
    registerPlugin(FilePondPluginFileRename);
    registerPlugin(FilePondPluginFileValidateSize);
    registerPlugin(FilePondPluginFileValidateType);
  }

  const serverLoad = (uniqueFileId: any, load: any, abort: any) => {
    const params = {
      Bucket: bucket,
      Key: uniqueFileId,
    };
    const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    s3.getObject(params, (err: any) => {
      if (err) abort();
      else load();
    });
    return { abort };
  };

  const serverProcess: any = (
    fieldName: string,
    file: File,
    metadata: Record<string, any>,
    load: (fileId: string) => void,
    abort: () => void
  ) => {
    console.log("namee", fieldName);

    const fileName = file.name;
    const contentType = file.type;
    const params = {
      ACL: acl,
      Body: file,
      Bucket: bucket,
      ContentType: contentType,
      Key: fileName,
      Metadata: metadata,
    };
    console.log("params", params);
    const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    s3.upload(params, (err: any) => {
      if (err) {
        console.log("error", err);
        abort();
      } else {
        load(fileName);
        {
          onUploadComplete && onUploadComplete({ contentType, fileName });
        }
      }
    });
    return { abort };
  };

  const serverRevert = (uniqueFileId: any, load: any, abort: any) => {
    const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    const params = {
      Bucket: bucket,
      Key: uniqueFileId,
    };
    s3.deleteObject(params, (err) => {
      if (err) abort();
      else load();
    });
  };

  const serverRemove = (error: any, { file: { name } }: any) => {
    const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    const params = {
      Bucket: bucket,
      Key: name,
    };
    s3.deleteObject(params, (err) => {
      if (!err) {
        {
          onRemoveComplete && onRemoveComplete({ name });
        }
      } else {
        console.log("error revert", err);
        console.log(error);
      }
    });
  };

  return (
    <>
      <FilePond
        allowProcess
        {...props}
        ref={forwardRef || ref}
        fileRenameFunction={fileRenameFunction}
        acceptedFileTypes={acceptedFileTypes}
        fileValidateTypeLabelExpectedTypes={fileValidateTypeLabelExpectedTypes}
        labelFileTypeNotAllowed="Invalid file format"
        maxFileSize={maxFileSize}
        onremovefile={serverRemove}
        server={{
          load: serverLoad,
          process: serverProcess,
          revert: serverRevert,
        }}
      >
        {/* {existingFiles.map((f) => (
          <File key={f} origin='local' src={f} />
        ))} */}
      </FilePond>
    </>
  );
};

interface IndexProps {
  acl?: string;
  bucket: string;
  error?: boolean;
  existingFiles?: string[];
  fieldDesign?: boolean;
  acceptedFileTypes?: string[] | undefined;
  fileValidateTypeLabelExpectedTypes?: string;
  forwardRef?: LegacyRef<FilePond> | undefined;
  identityId?: string;
  level?: string;
  maxFileSize?: string;
  onRemoveComplete?: ({ name }: { name: any }) => void;
  fileRenameFunction?: ({
    basename,
    extension,
  }: {
    basename: any;
    extension: any;
  }) => any;
  onUploadComplete?: (data: { contentType: string; fileName: string }) => void;
  ref?: LegacyRef<FilePond> | undefined;
}

export default Index;
