"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import "remixicon/fonts/remixicon.css";
import Logo from "/public/logo.png";
import Avatar from "/public/avatar.png";
import Chatgpt from "/public/chatgpt.png";
import BGIMG from "../../public/bg_img.jpg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import "react-toastify/dist/ReactToastify.css";
import FileUpload from "../components/fileupload/page";
import {
  ResizablePanelGroup,
  ResizableHandle,
  ResizablePanel,
} from "@/components/ui/resizable";
import { ToastContainer, toast } from "react-toastify";
import { getRequest, patchRequest, postRequest } from "@/services/api";
import PdfViewer from "@/components/PdfViewer/PdfViewer";
import Cookies from "universal-cookie";
import getS3File from "@/constants/get-aws-url";
import { redirect, useRouter } from "next/navigation";
import Loader from "@/components/Loader/loader";

const dropzoneStyle: React.CSSProperties = {
  border: "2px dashed #ccc",
  padding: "20px",
  textAlign: "center" as React.CSSProperties["textAlign"],
};

const App: React.FC = () => {
  const cookies = new Cookies();
  const userId = cookies.get("userId");
  const token = cookies.get("token");
  const isAdmin = Boolean(cookies.get("admin"));
  const router = useRouter();

  if (!token) {
    redirect("/signin");
  }

  const [pdfDataUrl, setPdfDataUrl] = useState<string[] | null>(null);
  const [pdfName, setPdfName] = useState<any>(null);
  const [pdfNameArr, setPdfNameArr] = useState<string[]>([]);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [summaryState, setSummaryState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<any>("");
  const [promptListState, setPromptListState] = useState<any>([]);
  const [historyState, setHistoryState] = useState<any>([]);
  const [activeHistory, setActiveHistory] = useState<any>(undefined);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // const url = useMemo(() => getS3File(pdfDataUrl!), [pdfDataUrl]);

  const fetchPdfName = async () => {
    const response: any = await getRequest({
      url: "/pdf/get",
    });
    setPdfName(response?.data?.pdf_name);
    setHistoryState(response?.data?.data);
    const length = response?.data?.data?.length;
    setActiveHistory(response?.data?.data[length - 1]);
  };

  const updatePdfName = async (name?: string) => {
    const response: any = await patchRequest({
      url: "/pdf/update",
      data: {
        pdf_name: name || pdfName,
      },
    });
    setPdfName(response?.data?.pdf_name);
    console.log(response?.data?.pdf_name);
  };

  useEffect(() => {
    if (userId) {
      fetchPdfName();
    }
  }, [userId]);

  useEffect(() => {
    const func = async () => {
      if (totalFiles === pdfNameArr.length && pdfNameArr.length > 0) {
        const res = await postRequest({
          url: "/history/get-summury",
          data: { pdfUrl: pdfNameArr },
        });
        updatePdfName(res?.data?.pdf_name);
      }
    };
    func();
  }, [totalFiles, pdfNameArr]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [promptListState]);

  const formSchema = z.object({
    prompt: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const payload = {
      prompt: data.prompt,
    };
    console.log(payload);
  }

  const resetStateHndler = () => {
    // setHistoryState([])
    setPromptListState([]);
  };

  const setHistoryHndler = (index: number) => {
    const data = historyState[index];
    setPromptListState(data?.history);
    setSummaryState(data?.summary);
    setPdfDataUrl(data?.pdfUrl);
    setActiveHistory(data);
  };

  const handleCopy = async (text: any) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Text copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy text. Please try again.");
    }
  };

  const handleKeyDown = async (e: any, name: any) => {
    const isEnterKey = name === "key" && e.key === "Enter" && e.target.value;
    const isClickEvent = name === "click" && text;
    if (isEnterKey || isClickEvent) {
      setLoading(true);
      if (promptListState?.length === 0) {
        try {
          const response: any = await postRequest({
            url: "/history/create",
            data: {
              userId: userId,
              pdfUrl: pdfName,
              prompt: e.target.value || text,
            },
          });
          if (response?.data) {
            fetchPdfName();
            setPromptListState(response?.data?.history?.history);
            setActiveHistory(response?.data?.history);
            setText("");
          }
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      } else {
        try {
          const response: any = await patchRequest({
            url: "/history/update",
            data: {
              historyId: activeHistory?._id,
              pdfUrl: pdfName,
              prompt: e.target.value || text,
            },
          });
          if (response?.data) {
            fetchPdfName();
            setText("");
            setPromptListState(response?.data?.history?.history);
          }
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      }
    }
  };

  const logoutHndler = () => {
    cookies.remove("token");
    cookies.remove("userId");
    router.refresh();
  };

  const handleAddFile = (error: any, file: any) => {
    if (!error && file.fileExtension === "pdf") {
      setTotalFiles((prev) => prev + 1);
    }
  };

  return (
    <>
      <div>
        <div className="flex">
          {/* <ResizablePanelGroup direction="horizontal"> */}
          {/* <ResizablePanel defaultSize={60}> */}
          <div className={` ${isAdmin ? "w-[60%]" : "w-full"} flex`}>
            <div className="w-full p-4 flex flex-col justify-between bg-[#F6F6F6] h-screen ">
              <div>
                <div className="flex mb-3 justify-between items-center ">
                  <div className="text-xl font-bold">
                    Environment Chat Board
                  </div>
                  <div
                    className="w-[6rem] h-10 rounded-2xl flex justify-start items-center cursor-pointer hover:bg-slate-100 px-2"
                    onClick={logoutHndler}
                  >
                    <i className="ri-logout-box-r-line text-[#666D80] me-3 text-lg"></i>
                    Logout
                  </div>
                </div>
                <div
                  ref={chatContainerRef}
                  className={`my-3 p-3 h-[70vh] rounded-2xl flex flex-col overflow-y-auto`}
                >
                  {(promptListState || [])?.map((item: any, index: any) => (
                    <>
                      <div className="flex flex-col">
                        <div className="flex">
                          <div>
                            <Image
                              className="w-10 h-10 rounded-full"
                              src={Avatar}
                              width={40}
                              height={40}
                              alt="Rounded avatar"
                            />
                          </div>
                          <div className="flex flex-col ms-2">
                            <div className="text-lg">You</div>
                            <div className="text-sm text-[#666D80] my-2">
                              @craiglevin
                            </div>
                            <div className="text-base text-[#666D80]">
                              {item?.prompt}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col my-6">
                        <div className="flex">
                          <div className="w-[7%]">
                            <Image
                              className="rounded-full"
                              src={BGIMG}
                              width={40}
                              height={400}
                              alt="chatgpt"
                            />
                          </div>
                          <div className="flex flex-col ms-2 w-[90%]">
                            <div className="text-lg">Environment AI</div>
                            <div className="text-sm text-[#666D80] my-2">
                              @environment-ai
                            </div>
                            <div className="text-base text-[#666D80] mb-2">
                              {item?.response}
                            </div>
                            <div className="flex">
                              <i
                                onClick={() => {
                                  navigator.clipboard.writeText(item?.response);
                                  toast.success("text copied.");
                                }}
                                className="ri-clipboard-line text-base cursor-pointer"
                              ></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                  <div ref={bottomRef}></div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="mt-2 mb-3 relative">
                  <input
                    type="text"
                    value={text}
                    onChange={(e: any) => setText(e.target.value)}
                    className="w-full py-2 pl-4 pr-10 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm "
                    placeholder="Message Environment AI..."
                    onKeyDown={(event: any) => handleKeyDown(event, "key")}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                    {loading ? (
                      <Loader />
                    ) : (
                      <i
                        className="ri-send-plane-fill w-5 h-5 text-gray-400"
                        onClick={(event: any) => handleKeyDown("", "click")}
                      ></i>
                    )}
                  </div>
                </div>
                <div className="mb-3 text-[#666D80] ">
                  Recommended Questions:
                </div>
                <div className="flex">
                  <div className="px-3 py-2 me-2 text-sm hover:bg-slate-200 bg-[#D9D9D9] text-black rounded-xl cursor-pointer">
                    Design style
                  </div>
                  <div className="px-3 py-2 me-2 text-sm bg-[#D9D9D9] hover:bg-slate-200 text-black rounded-xl cursor-pointer">
                    Change furniture or color
                  </div>
                  <div className="px-3 py-2 text-sm bg-[#D9D9D9] hover:bg-slate-200 text-black rounded-xl cursor-pointer">
                    Design uploaded picture
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* </ResizablePanel> */}
          {/* <ResizableHandle withHandle /> */}
          {/* <ResizablePanel defaultSize={40}> */}
          {isAdmin && (
            <div className="w-[40%] p-4 flex flex-col justify-between bg-[#F6F6F6] h-screen">
              <div className=" p-3 h-[95vh] max-h-[95vh] bg-white rounded-2xl flex flex-col justify-center">
                {/* <div className="max-h-[25vh] overflow-y-auto text-base text-[#666D80]">
                    {summaryState}
                  </div> */}
                <div className="flex justify-center">
                  <FileUpload
                    setSummaryState={setSummaryState}
                    setPdfDataUrl={setPdfDataUrl}
                    resetStateHndler={resetStateHndler}
                    setPdfNameArr={setPdfNameArr}
                    handleAddFile={handleAddFile}
                    setTotalFiles={setTotalFiles}
                    totalFiles={totalFiles}
                    pdfNameArr={pdfNameArr}
                  />
                </div>
              </div>
              {/* <div className="h-[80vh] mt-4 bg-white rounded-2xl flex flex-col"> */}
              {/* {pdfDataUrl ? (
                  <PdfViewer url={url} initialPage={page} />
                ) : (
                  <div className="text-3xl flex justify-center items-center h-full text-blue-500 font-semibold cursor-pointer hover:underline">
                    {`Let's go! Upload your PDF file now.`}
                  </div>
                )} */}
              {/* </div> */}
            </div>
          )}
          {/* </ResizablePanel> */}
          {/* </ResizablePanelGroup> */}
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default App;
