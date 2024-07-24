import { useCallback, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState(mediaUrl);

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFile(acceptedFiles);
    fieldChange(acceptedFiles);
    setFileUrl(URL.createObjectURL(acceptedFiles[0]));
  }, [fieldChange]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpeg', '.jpg', '.svg'],
      'video/*': ['.mp4', '.webm'],
    },
  });

  return (
    <div {...getRootProps()} className="flex flex-center flex-col bg-dark-3 rounded-x1 cursor-pointer">
      <input {...getInputProps()} className="cursor-pointer" />
      {fileUrl ? (
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            {file[0]?.type.startsWith('video/') ? (
              <video controls className="file_uploader-img">
                <source src={fileUrl} type={file[0].type} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={fileUrl} alt="image" className="file_uploader-img" />
            )}
          </div>
          <p className="file_uploader-label">Apăsați aici sau trageți fișierul pentru a-l înlocui</p>
        </>
      ) : (
        <div className="file_uploader-box">
          <img src="/assets/icons/file-upload.svg" width={96} height={77} alt="file-upload" />
          <h3 className="base-medium text-light-2 mb-2 mt-6">Atașați fișierul</h3>
          <p className="text-light-4 small-regulat mb-6">SVG, PNG, JPG, MP4, WEBM</p>
          <Button className="shad-button_dark_4">Selectați din computer</Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
