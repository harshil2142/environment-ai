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
import MarkdownViewer from "@/components/MarkdownViewer";

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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [text, setText] = useState<any>("");
  const [promptListState, setPromptListState] = useState<any>([]);
  const [historyState, setHistoryState] = useState<any>([]);
  const [activeHistory, setActiveHistory] = useState<any>(undefined);
  const [pdfData, setPdfData] = useState([]);

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
      if (totalFiles === pdfData.length && pdfData.length > 0) {
        setPdfLoading(true)
        const res = await postRequest({
          url: "/history/get-summury",
          data: { pdfData: pdfData.map((item: any) => Object.values(item)[0]) },
        });
        if(res){
          setPdfLoading(false)
          updatePdfName(res?.data?.pdf_name);
        }else{
          setPdfLoading(false)
        }
      }
    };
    func();
  }, [totalFiles, pdfData]);

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
  console.log(promptListState, "state");
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
  console.log(pdfData);

  return (
    <>
      <div>
        <div className="flex">
          {/* <ResizablePanelGroup direction="horizontal"> */}
          {/* <ResizablePanel defaultSize={60}> */}
          <div className="w-[15%] p-4 pr-0 border-r-2 border-[#ECEFF3] h-screen bg-white flex flex-col justify-between">
            <div>
              <div>
                <Image
                  src={
                    "https://lirp.cdn-website.com/3f447af7/import/clib/ecowb_org/dms3rep/multi/opt/XLarge-Logo-20e48cb7-469x154-1920w.png"
                  }
                  alt="image"
                  height={"100"}
                  width={"100"}
                />
              </div>
              <div>
                <Button
                  className="mt-4 w-[90%] me-4 text-start bg-[#097E4D] hover:bg-[#81b59f]"
                  onClick={() => {
                    resetStateHndler();
                    setSummaryState("");
                  }}
                >
                  <div className="flex justify-start items-center">
                    <i className="ri-add-line text-white mx-3"></i>
                    Start New Chat
                  </div>
                </Button>
              </div>
              <div className="text-[#808897] text-sm mt-3 flex items-center">
                RECENT CHATS <hr className="ms-[2%] w-[40%]" />
              </div>
              <div className="overflow-y-auto h-[50vh]">
                <div
                  className="w-[90%] border-2 border-gray-300 rounded-xl h-10 mt-3 flex justify-center hover:bg-slate-50 items-center bg-[#DFE1E6] text-black truncate"
                  title={pdfName || ""}
                >
                  <span className="px-2">{pdfName || ""}</span>
                </div>
              </div>
            </div>
            <div>
              <div
                className="w-full h-10 rounded-2xl mt-2 flex justify-start items-center cursor-pointer hover:bg-slate-100 px-2"
                onClick={logoutHndler}
              >
                <i className="ri-logout-box-r-line text-[#666D80] me-3 text-lg"></i>
                Logout
              </div>
            </div>
          </div>
          <div className={` ${isAdmin ? "w-[65%]" : "w-[85%]"} flex`}>
            <div className="w-full p-4 flex flex-col justify-between bg-[#F6F6F6] h-screen ">
              <div>
                <div className="flex mb-3 justify-between items-center ">
                  <div className="text-xl font-bold flex">
                    Ecologistics without Boarders <div className="text-green-800"> (
                    {isAdmin ? "Admin User" : "Normal User"} ) </div>
                  </div>
                </div>
                <div
                  ref={chatContainerRef}
                  className={`my-3 p-3 h-[70vh] rounded-2xl flex flex-col overflow-y-auto `}
                >
                 {pdfLoading ?  <Loader className="m-auto h-14 w-14" /> : (promptListState || [])?.map((item: any, index: any) => (
                    <>
                      <div className="flex flex-col relative z-10">
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
                            <div className="text-sm text-black my-2">
                              @craiglevin
                            </div>
                            <div className="text-base text-black">
                              {item?.prompt}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col my-6">
                        <div className="flex">
                          <div className="w-[7%]">
                            <Image
                              className="w-10 h-10 rounded-full"
                              src={BGIMG}
                              width={40}
                              height={40}
                              alt="chatgpt"
                            />
                          </div>
                          <div className="flex flex-col ms-2 w-[90%]">
                            <div className="text-lg">Environment AI</div>
                            <div className="text-sm text-black my-2">
                              @environment-ai
                            </div>
                            <div className="text-base text-black mb-2">
                              <MarkdownViewer content={item?.response} />
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
                  )) } 
                  <div ref={bottomRef}></div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="mt-2 mb-3 relative">
                  <input
                    type="text"
                    value={text}
                    disabled={pdfLoading}
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
              </div>
            </div>
          </div>
          {/* </ResizablePanel> */}
          {/* <ResizableHandle withHandle /> */}
          {/* <ResizablePanel defaultSize={40}> */}
          {isAdmin && (
            <div className="w-[30%] p-4 flex flex-col justify-between bg-[#F6F6F6] h-screen">
              <div className=" p-3 h-[95vh] max-h-[95vh] bg-[#7ca091] rounded-2xl flex flex-col justify-center">
                {/* <div className="max-h-[25vh] overflow-y-auto text-base text-black">
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
                    setPdfData={setPdfData}
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
