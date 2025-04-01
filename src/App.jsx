import React from 'react';
import MultiStepForm from './components/StepForm';
import logo from "./assets/logo.png"

const App = () => {
  return (
    <div className="flex flex-col h-screen w-full">
      <header className="w-full bg-[#003366] h-18 flex items-center px-16 py-2">
        <div className="bg-white rounded-full p-2 w-16 h-16 flex items-center justify-center mt-3">
          <img src={logo} alt="P-Y25 Logo" className="w-12 h-12 " />
        </div>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-[15%] sticky bg-[#003366] flex flex-col items-center pt-8"></div>
        {/* Main Content */}
        <div className="flex-1 w-[85%] ">
          <div className="mx-auto px-8 py-12">
            <MultiStepForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;