import React from "react"
import { createRoot } from "react-dom/client"

const Popup = () => {
  
  return (
    <>
      <div style={{ minWidth: "700px", minHeight: "500px"  }}/>
    </>
  )
}

const root = createRoot(document.getElementById("root")!)

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
)
