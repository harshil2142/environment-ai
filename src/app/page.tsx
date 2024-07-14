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

  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [summaryState, setSummaryState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<any>("");
  const [pageLoading, setPageLoading] = useState<any>({
    loading: false,
    index: 0,
  });
  const [page, setPage] = useState(0);
  const [promptListState, setPromptListState] = useState<any>([]);
  const [historyState, setHistoryState] = useState<any>([]);
  const [activeHistory, setActiveHistory] = useState<any>(undefined);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const url = useMemo(() => getS3File(pdfDataUrl!), [pdfDataUrl]);

  const fetchHistory = async () => {
    const response: any = await getRequest({
      url: "/history/get",
      params: { userId, page: 1, size: 7 },
    });
    setHistoryState(response?.data?.data);
    const length = response?.data?.data?.length;
    setActiveHistory(response?.data?.data[length - 1]);
  };

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

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
      setPage(0);
      setLoading(true);
      if (promptListState?.length === 0) {
        try {
          const response: any = await postRequest({
            url: "/history/create",
            data: {
              summary: summaryState,
              userId: userId,
              pdfUrl: pdfDataUrl,
              prompt: e.target.value || text,
            },
          });
          if (response?.data) {
            fetchHistory();
            setPromptListState(response?.data?.history?.history);
            setActiveHistory(response?.data?.history?.history[0]);
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
              // chatHistory: [],
              chatHistory: promptListState?.slice(-1),
              prompt: e.target.value || text,
            },
          });
          if (response?.data) {
            fetchHistory();
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

  const pageNoApiCall = async (response: any, pdfName: any, index: number) => {
    setPageLoading({
      loading: true,
      index: index,
    });
    try {
      const res: any = await postRequest({
        url: "/history/get-pageno",
        data: {
          pdfUrl: pdfName,
          response,
        },
      });
      if (res?.data) {
        setPage(res?.data?.pageNo);
      }
      setPageLoading({
        loading: false,
        index: 0,
      });
    } catch (error) {
      setPageLoading({
        loading: false,
        index: 0,
      });
    }
  };

  const logoutHndler = () => {
    cookies.remove("token");
    cookies.remove("userId");
    router.refresh();
  };

  return (
    <>
      <div>
        <div className="flex">
          {/* <ResizablePanelGroup direction="horizontal"> */}
            {/* <ResizablePanel defaultSize={60}> */}
              <div className={` ${isAdmin ? "w-[60%]" : "w-full"} flex`}>
                {/* <div className="w-[30%] p-4 pr-0 border-r-2 border-[#ECEFF3] h-screen bg-white flex flex-col justify-between">
                  <div>
                    <div>
                      <Image
                        src={Logo}
                        alt="image"
                        height={"100"}
                        width={"100"}
                      />
                    </div>
                    <div>
                      <Button
                        className="mt-4 w-[90%] me-4 text-start"
                        onClick={() => {
                          resetStateHndler();
                          setPdfDataUrl("");
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
                      {historyState?.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="w-[90%] border-2 border-gray-300 rounded-xl h-10 mt-3 flex justify-center hover:bg-slate-50 items-center cursor-pointer bg-[#DFE1E6] text-black truncate"
                          title={
                            Array.isArray(historyState) &&
                            historyState.length > 0 &&
                            (historyState[index]?.history[0]?.pdfName || "")
                          }
                          onClick={() => {
                            setHistoryHndler(index);
                          }}
                        >
                          <span className="mx-2">
                            {" "}
                            {Array.isArray(historyState) &&
                              historyState.length > 0 &&
                              (historyState[index]?.history[0]?.pdfName || "")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="w-full h-10 rounded-2xl mt-2 flex justify-start items-center cursor-pointer hover:bg-slate-100 px-2">
                      <i className="ri-upload-2-line text-[#666D80] me-3 text-lg"></i>
                      Upgrade to plus
                    </div>
                    <div className="w-full h-10 rounded-2xl mt-2 flex justify-start items-center cursor-pointer hover:bg-slate-100 px-2">
                      <i className="ri-settings-5-line text-[#666D80] me-3 text-lg"></i>
                      Setting
                    </div>
                    <div
                      className="w-full h-10 rounded-2xl mt-2 flex justify-start items-center cursor-pointer hover:bg-slate-100 px-2"
                      onClick={logoutHndler}
                    >
                      <i className="ri-logout-box-r-line text-[#666D80] me-3 text-lg"></i>
                      Logout
                    </div>
                  </div>
                </div> */}
                <div  className="w-full p-4 flex flex-col justify-between bg-[#F6F6F6] h-screen ">
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
                      className={`my-3 p-3 h-[70vh] rounded-2xl flex flex-col overflow-y-auto bg-[url('../../public/bg_img.jpg')]`}
                    >
                      {/* {summaryState && <div className="mb-4">
                        <div className="mb-3 font-bold">Summary : </div>
                        <div>
                        {summaryState}
                        </div>
                      </div>} */}
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
                                  src={Chatgpt}
                                  width={40}
                                  height={400}
                                  alt="chatgpt"
                                />
                              </div>
                              <div className="flex flex-col ms-2 w-[90%]">
                                <div className="text-lg">
                                  Design Verification AI
                                </div>
                                <div className="text-sm text-[#666D80] my-2">
                                  @designai
                                </div>
                                <div className="text-base text-[#666D80] mb-2">
                                  {item?.response}
                                </div>
                                <div className="flex">
                                  <i
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        item?.response
                                      );
                                      toast.success("text copied.");
                                    }}
                                    className="ri-clipboard-line text-base cursor-pointer"
                                  ></i>

                                  {pageLoading.loading &&
                                  pageLoading.index === index ? (
                                    <Loader className="ms-2" />
                                  ) : (
                                    <i
                                      onClick={() =>
                                        pageNoApiCall(
                                          item?.response,
                                          item?.pdfName,
                                          index
                                        )
                                      }
                                      className="ri-pages-line text-base cursor-pointer ms-2"
                                    ></i>
                                  )}
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
              {isAdmin && <div className="w-[40%] p-4 flex flex-col justify-between bg-[#F6F6F6] h-screen">
                <div className=" p-3 h-[20vh] bg-white rounded-2xl flex flex-col justify-center">
                  {/* <div className="max-h-[25vh] overflow-y-auto text-base text-[#666D80]">
                    {summaryState}
                  </div> */}
                  <div className="flex justify-center">
                    <FileUpload
                      setSummaryState={setSummaryState}
                      setPdfDataUrl={setPdfDataUrl}
                      resetStateHndler={resetStateHndler}
                    />
                  </div>
                </div>
                <div className="h-[80vh] mt-4 bg-white rounded-2xl flex flex-col">
                  {pdfDataUrl ? (
                    <PdfViewer url={url} initialPage={page} />
                  ) : (
                    <div className="text-3xl flex justify-center items-center h-full text-blue-500 font-semibold cursor-pointer hover:underline">
                      {`Let's go! Upload your PDF file now.`}
                    </div>
                  )}
                </div>
              </div>}
            {/* </ResizablePanel> */}
          {/* </ResizablePanelGroup> */}
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default App;
