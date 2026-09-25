import Sidebar from './components/Sidebar'
import ChatContainer from './components/ChatContainer'
import RightSidebar from './components/RightSidebar'

function App() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-[url('./assets/bgImage.svg')]">
      <div className="min-h-screen w-full bg-black/50 backdrop-blur-lg flex items-center justify-center">
        <div className="w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl grid grid-cols-[1fr_2fr_1fr]">
          <Sidebar />
          <ChatContainer />
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}

export default App