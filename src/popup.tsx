import React from "react"
import { createRoot } from "react-dom/client"
import "./popup.css"

const Popup = () => {
  
  return (
    <>
      <div id="popup-window"/>
    </>
  )
}

const root = createRoot(document.getElementById("root")!)

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
)
