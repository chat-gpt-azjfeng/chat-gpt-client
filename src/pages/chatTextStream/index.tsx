/* eslint-disable @typescript-eslint/no-explicit-any */
import { Layout, Input } from "tdesign-react";

import ModHeader from "../../components/ModHeader";
import ModAside from "../../components/ModAside";
import { useEffect, useState, useRef } from "react";
import hash from "js-sha256";
const { Content, Aside } = Layout;

let hashText: string = "";
let sendText: string = "";

function ChatTextStreamPages() {
  const wsClientRef = useRef<any>(null);
  // const [sendText, setSendText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [token, setToken] = useState<any>({});
  const [requestIng, setRequestIng] = useState(false);
  const [chatHash, setChatHash] = useState("");
  useEffect(() => {
    const initSocket = () => {
      if (!wsClientRef.current) {
        const wsClient = new WebSocket("ws://localhost:4000");
        wsClient.addEventListener("open", () => {
          console.log("Connected to WebSocket server");
        });
        wsClient.addEventListener("message", (event) => {
          receiveResult(event.data);
        });

        wsClient.addEventListener("error", (error) => {
          wsClient.close();
          console.log("WebSocket error:", error);
        });

        wsClient.addEventListener("close", () => {
          console.log("WebSocket connection closed");
        });
        return wsClient;
      }
    };
    wsClientRef.current = initSocket();
    return () => {
      try {
        wsClientRef.current.close();
        wsClientRef.current = null;
      } catch (error) {
        console.log(error);
      }
    };
  }, []);

  useEffect(() => {
    if (wsClientRef.current && sendText) {
      // 发送消息
      const message = {
        type: "message",
        prompt: sendText,
      };
      if (wsClientRef?.current?.readyState === 1) {
        wsClientRef.current?.send(JSON.stringify(message));
        setRequestIng(true);
      }
    }
  }, [chatHash]);

  const generateHash = (text: string) => {
    return hash.sha256(text);
  };
  const onEnter = (value: string) => {
    if (requestIng || !value) {
      return;
    }
    hashText = generateHash(value + new Date().getTime());
    sendText = value;
    const hash = generateHash(value + new Date().getTime());
    setChatHash(hash);
    setToken({
      ...token,
      [value + new Date().getTime()]: { role: "input", value },
    });
    // setSendText(value);
    setInputValue("");
  };

  const receiveResult = (data: any) => {
    const result = JSON.parse(data);
    const message = result?.choices[0];
    if (message.finish_reason) {
      setRequestIng(false);
      return;
    }
    // 处理推送的数据
    const { content, role } = message.delta;
    if (!token[hashText]) {
      token[sendText + new Date().getTime()] = { role: "input", value: sendText };
      token[hashText] = {
        content: (token[hashText]?.content || "") + content,
        role,
      };
      setToken({
        ...token,
      });
    } else {
      token[hashText] = {
        content: (token[hashText]?.content || "") + content,
        role,
      };
      setToken({ ...token });
    }
  };
  return (
    <div className="pg-text2img">
      <Layout className="is-console" style={{ height: "100%" }}>
        <ModHeader />
        <Layout>
          <Aside style={{ height: "100%" }}>
            <ModAside />
          </Aside>
          <Content
            className="is-flex"
            style={{
              background: "#141415",
              position: "relative",
              display: "flex",
            }}
          >
            <div style={{ flex: 1, paddingBottom: 100 }}>
              {Object.values(token).map((item: any, key: number) => {
                if (item.role === "input") {
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "white",
                        justifyContent: "end",
                      }}
                      key={key}
                    >
                      <div
                        style={{
                          border: "1px solid #E5EAF3",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          marginTop: "32px !important",
                          background: "grey",
                        }}
                      >
                        {item.value}
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          margin: 15,
                          position: "relative",
                          float: "right",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: `
                    <svg width="32" height="32" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g >
                        <!--背景色配置处-->
                        <rect x="1" y="1" width="36" height="36" rx="18" fill="#27B3BC"/>
                        <!--文本配制处-->
                        <text fill="#ffffff" x="19"  y="20" dominant-baseline="middle" style="text-anchor: middle"  font-family="PingFang SC" font-size="18"  font-weight="500">Y</text>
                        <!--边框-->
                        <rect x="1" y="1" width="36" height="36" rx="18" stroke="#ffffff" stroke-width="2"/>
                      </g>
                    </svg>
                  `,
                        }}
                      />
                    </div>
                  );
                }
                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      color: "white",
                      justifyContent: "flex-start",
                      width: "50%",
                    }}
                    key={key}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        margin: 15,
                        position: "relative",
                        float: "right",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: `
                  <svg width="32" height="32" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g >
                      <!--背景色配置处-->
                      <rect x="1" y="1" width="36" height="36" rx="18" fill="#27B3BC"/>
                      <!--文本配制处-->
                      <text fill="#ffffff" x="19"  y="20" dominant-baseline="middle" style="text-anchor: middle"  font-family="PingFang SC" font-size="18"  font-weight="500">O</text>
                      <!--边框-->
                      <rect x="1" y="1" width="36" height="36" rx="18" stroke="#ffffff" stroke-width="2"/>
                    </g>
                  </svg>
                `,
                      }}
                    />
                    <div
                      style={{
                        border: "1px solid #E5EAF3",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        marginTop: "16px",
                        background: "grey",
                      }}
                      className="markdown-body"
                      dangerouslySetInnerHTML={{
                        __html: (window as any).marked.parse(item.content),
                      }}
                    ></div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 30,
                left: 20,
                right: 20,
                height: 50,
              }}
            >
              <Input
                value={inputValue}
                align="left"
                size="medium"
                status="default"
                type="text"
                style={{ height: "100%" }}
                onEnter={(value) => onEnter(value)}
                onChange={(value) => setInputValue(value)}
              />
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default ChatTextStreamPages;
