"use client";
import "regenerator-runtime";
import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import client from "@/services/client";
import { application } from "@/config/apis";
import { BsFillMicFill } from "react-icons/bs";
import Link from "next/link";
import Image from "next/image";
import "./style.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AiOutlineLogout } from "react-icons/ai";
import CustomToastEducation from "../Toast/CustomToastEducation";
import toast from "react-hot-toast";
import { ToastTypes } from "@/enum/ToastTypes";
import FeedbackForm from "../FeedbackForm/FeedbackForm";
import { BiLeftArrowAlt } from "react-icons/bi";
const VoiceAssistant = () => {
  const [userInput, setUserInput] = useState<any>("");
  const [userOutput, setOutput] = useState<any>("");
  const [searchList, setSearchlist] = useState<[]>([]);
  const [showFeedbackPage, setShowFeedbackPage] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  useEffect(() => {
    setTimeout(() => {
      // window.location.reload();
      showSearchList();
    }, 4000);
  }, []);

  const sites = [
    {
      siteName: "youtube",
      url: "https://www.youtube.com",
      response: "Opening youtube",
    },
    {
      siteName: "google",
      url: "https://www.google.com",
      response: "Opening google",
    },
    {
      siteName: "wikipedia",
      url: "https://www.wikipedia.com",
      response: "Opening Wikipedia",
    },
  ];

  async function chatGPT3(message: any) {
    const lowerCaseCommand =
      userInput.toLowerCase() || transcript.toLowerCase();
    if (userInput.includes(`open `) || transcript.includes("open ")) {
      for (const site of sites) {
        if (lowerCaseCommand.includes(`open ${site.siteName}`)) {
          window.open(site.url);
          setUserInput("");
          setOutput(site.response);
          return;
        }
      }
      showAlert("Command not recognized");
    } else {
      try {
        const response: any = await client.post(
          `${application.baseUrl}/api/command`,
          {
            command: message,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setUserInput("");
        setOutput(response.data.response);
        return response;
      } catch (error: any) {
        showAlert("Something went wrong..!");
        return error;
      }
    }
  }

  useEffect(() => {
    showSearchList();
  }, []);

  async function showSearchList() {
    try {
      const response: any = await client.get(
        `${application.baseUrl}/chatSearch`
      );
      setSearchlist(response?.data?.data);
    } catch (error: any) {
      console.log(error);
    }
  }
  const handleTextToSpeech = async (text: string) => {
    try {
      if (text) {
        const response = await chatGPT3(text);
        const speechSynthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(response.data.response);
        const removeVoice = utterance.text;
        if (removeVoice.includes("https")) {
          ("");
        } else {
          speechSynthesis.speak(utterance);
        }
      }
    } catch (e: any) {
      // showAlert("Please provide a valid command.");
      console.log("Please provide a valid command.");
    }
  };

  useEffect(() => {
    try {
      if (!listening && transcript) {
        chatGPT3(transcript).then((response) => {
          try {
            const speechSynthesis = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(
              response.data.response
            );

            const getDel = utterance.text;
            if (getDel.includes("https")) {
              ("");
            } else {
              speechSynthesis.speak(utterance);
            }
          } catch (e: any) {
            console.log(e);
          }
        });
      }
    } catch (e) {
      showAlert("Please provide a valid command.", ToastTypes.ERROR);
    }
  }, [transcript, listening]);

  const handleSendMessage = async () => {
    try {
      const response = await chatGPT3(userInput);
      setUserInput("");
      setOutput(response.data.response);
      resetTranscript();
    } catch (error) {
      console.log(error);
    }
  };

  const router = useRouter();
  const check = async () => {
    if (localStorage.getItem("accessToken")) {
      try {
        const response = await axios.get("http://127.0.0.1:5000/check", {
          headers: {
            authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (!response.data.isSuccess) {
          router.push("/");
        }
      } catch (e: any) {
        console.log(e);
        // showAlert(e);
      }
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    check();
  }, []);

  const showAlert = (message: any, type?: any) => {
    toast(
      (t) => (
        <CustomToastEducation
          type={type}
          title=""
          message={message}
          t={t}
          singleLineMessage
          autoHide
        />
      ),
      {
        style: {
          background: "transparent",
          width: "auto",
          boxShadow: "none",
        },
      }
    );
  };
  const stopTextToSpeech = () => {
    window.speechSynthesis.cancel();
  };

  return (
    <div className="my-2 flex   h-full w-3/5   bg-white rounded-lg overflow-hidden relative">
      <div className="flex flex-col  w-[25%] pr-2 bg-gray-800 py-4 max-h-full h-full text-white px-1">
        <div className="px-2">
          Welcome, <br />{" "}
          <p className="text-[#34eb9b] font-bold ">
            {localStorage.getItem("username")}
          </p>
        </div>
        <div className="mt-7">
          <div className="text-gray-300">Today</div>
          <div className="mt-2 max-h-2/5 h-2/5 overflow-y-scroll ">
            {searchList.map((element: any, index: number) => (
              <div key={index}>
                <p className="hover:bg-gray-600  p-1  rounded-md text-[13px] mx-1 cursor-pointer">
                  {element.command}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="bottom-5 absolute ">
          <div
            onClick={() => setShowFeedbackPage(true)}
            className="cursor-pointer text-[13px] text-gray-300 mb-1 hover:bg-slate-700 rounded-lg py-2 px-1"
          >
            Share Feedback
          </div>
          <Link className=" " href={"/ChatHistory"}>
            <p className="cursor-pointer text-[13px] text-gray-300 mb-1 hover:bg-slate-700 rounded-lg py-2 px-1 ">
              Check <b>chat </b> history
            </p>
          </Link>
          <div
            onClick={() => {
              localStorage.setItem("accessToken", "");
              check();
            }}
            className="flex  items-center gap-1 cursor-pointer hover:bg-slate-700 rounded-lg py-2 px-1 w-auto  text-red-500 text-[15px]"
            title="logout"
          >
            {" "}
            <AiOutlineLogout className="-rotate-90 p-0 m-0" /> Logout
          </div>
        </div>
      </div>
      {/* Main content*/}
      <div className={`${showFeedbackPage ? "flex flex-col justify-center w-3/4" : "flex flex-col w-3/4  justify-center items-center"}`}>
        {showFeedbackPage ? (
          <div className="flex">
            <p 
              onClick={() => setShowFeedbackPage(false)}
              className="cursor-pointer top-2 absolute "
              >
              <BiLeftArrowAlt className="h-6 w-40 " />
            </p>
          <div className="flex justify-center items-center w-3/4">
              <FeedbackForm/>
          </div>
          </div>
        ) : (
          <>
            {" "}
            <div className="h-[70%] max-h-[70%]  ">
              <div className="flex justify-center items-center gap-2 pt-6 text-[30px] ">
                <div className="font-bold text-[#333333]">Your</div>
                <div
                  className={` logo-container ${
                    listening ? "logo-animation" : ""
                  }`}
                >
                  <Image
                    src="/VoiceAssistantLogo.png"
                    alt="Voice Assistant Logo"
                    width={70}
                    height={5}
                  />
                </div>
                <div>
                  <b className="text-orange-400">Assistant</b>
                </div>
              </div>
              <div className="justify-center  items-center pt-4 max-h-[75%] overflow-y-scroll mt-4">
                {!userOutput ? (
                  <div className="flex flex-col justify-center items-center  mt-20  font-bold">
                    <div>How can I help you today?</div>
                  </div>
                ) : (
                  transcript && (
                    <div className="font-bold text-center">{transcript}</div>
                  )
                )}
                {userOutput.includes("https") &&
                userOutput.startsWith("https://www.youtube.com/") ? (
                  <div className="text-center">Playing..</div>
                ) : userOutput.includes("https") ? (
                  <div className="text-black !overflow-y-scroll  mx-4">
                    <GetFormattedText data={userOutput} />
                  </div>
                ) : (
                  <div>
                    <p className="text-center  mx-4">{userOutput}</p>
                    {userOutput && (
                      <div
                        className="text-center cursor-pointer text-gray-400 font-semibold text-[10px] pt-4 start-1"
                        onClick={stopTextToSpeech}
                      >
                        Stop generating a response.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex h-[30%]   max-h-[30%] flex-col justify-center items-center mt-10">
              {listening ? (
                <p className="pb-4">{"Go ahead, I`m listening..."}</p>
              ) : (
                <div className=" text-base font-sans pb-2">
                  Click on <b>mic</b> to ask anything
                  <br />{" "}
                  <p className="text-center ">
                    or enter <b>text</b>
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center border-[2px] border-gray-600 rounded-md w-[500px] mt-3">
                <input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className=" h-full p-2 outline-none px-4 bg-transparent"
                  placeholder="Enter a message..."
                />
                <div className="flex justify-center items-center gap-2 ">
                  <div className="w-full h-full flex justify-center items-center">
                    <div
                      onClick={() => {
                        !listening
                          ? SpeechRecognition.startListening()
                          : SpeechRecognition.stopListening();
                        setOutput("");
                      }}
                    >
                      <BsFillMicFill
                        className={`text-2xl   ${
                          listening ? "text-green-500" : "text-[#808080]"
                        }`}
                      />
                    </div>
                  </div>
                  <button
                    className={`font-[700] w-fit px-2 h-full ${
                      userInput ? "cursor-pointer" : "cursor-default"
                    }`}
                    onClick={() => {
                      handleTextToSpeech(userInput), resetTranscript;
                    }}
                    disabled={userInput.length == 0}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="icon-sm m-1 md:m-0"
                      height={25}
                      width={25}
                    >
                      <path
                        d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z"
                        fill={`${userInput ? "#19C37D" : "grey"}`}
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="pt-2  text-[12px] font-sans">
                {" "}
                Please input the correct command for an accurate response
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;

const GetFormattedText: React.FC<{ data: string }> = ({ data }) => {
  const [isPointedData, setIsPointedData] = useState<boolean>(false);
  const [textData, setTextData] = useState<string[]>([]);
  useEffect(() => {
    let i = 1;
    let count = 0;
    let text = data;
    while (i) {
      if (data.includes(`${i}. `)) {
        text = text.split(`${i}. `)[0] + `\n\n${i}. ` + text.split(`${i}. `)[1];
        count++;
      } else {
        break;
      }
      i++;
    }
    if (count > 2) {
      setIsPointedData(true);
      setTextData(text.split("\n\n"));
    }
  }, [data]);
  return (
    <div className="">
      {isPointedData ? (
        <div className="">
          {textData.map((ele: any, ind: number) => (
            <div className="my-4" key={ind}>
              {ind === 0 ? <b>{ele}</b> : ele}
            </div>
          ))}
        </div>
      ) : (
        data
      )}
    </div>
  );
};
