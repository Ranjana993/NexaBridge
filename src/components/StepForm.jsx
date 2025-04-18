import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import fileIcon from "../assets/file-icon.svg";
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

// Enhanced Typewriter component with cursor and cleanup
const Typewriter = ({ text, speed = 30, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (text) {
      const timeout = setTimeout(() => {
        if (currentIndex < text.length) {
          setDisplayedText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }
      }, currentIndex === 0 ? delay : speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed, delay]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span>
      {displayedText}
      <span className="animate-pulse"></span>
    </span>
  );
};

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [analysisDescription, setAnalysisDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Validation schemas
  const projectNameSchema = yup.object().shape({
    projectName: yup.string().required('Project name is required').min(3, 'Project name must be at least 3 characters'),
  });

  const analysisDescriptionSchema = yup.object().shape({
    analysisDescription: yup.string().required('Analysis description is required').min(10, 'Please provide more details (at least 10 characters)'),
  });

  // Form handlers
  const {
    register: registerStep1,
    handleSubmit: handleStep1,
    formState: { errors: errorsStep1 },
    trigger: triggerStep1
  } = useForm({
    resolver: yupResolver(projectNameSchema),
  });

  const {
    register: registerStep2,
    handleSubmit: handleStep2,
    formState: { errors: errorsStep2 },
    trigger: triggerStep2
  } = useForm({
    resolver: yupResolver(analysisDescriptionSchema),
  });

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const onStep1Submit = async (data) => {
    const isValid = await triggerStep1();
    if (isValid) {
      setProjectName(data.projectName);
      setStep(2);
    } else {
      toast.error(errorsStep1.projectName?.message);
    }
  };

  const onStep2Submit = async (data) => {
    const isValid = await triggerStep2();
    if (isValid) {
      setAnalysisDescription(data.analysisDescription);
      setStep(3);
    }
  };

  const handleSkipFiles = () => {
    setStep(4);
  };

  const onSubmit = async () => {
    const formData = new FormData();
    formData.append('projectName', projectName);
    formData.append('analysisDescription', analysisDescription);

    if (files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Texts for each step
  const stepTexts = {
    1: "Let’s get you started by naming this analysis so it’s easier for you to come back to later .",
    2: "Great! That’s a great name, now let’s try to understand what are you trying to understand a little better. Can you try to explain exactly what you are trying to analyse.",
    3: "Are there any files you would like to upload related to this, that might help me with this analysis?",
    4: "Are there any files you would like to upload related to this, that might help me with this analysis?"
  };

  return (
    <div className="flex items-center p-4">
      <div className="w-full overflow-hidden">
        <h1 className="text-xl font-bold text-center py-4 px-6">Welcome to P-Y25</h1>

        <div className="p-6">
          {
            submitSuccess ?
              (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8"
                >
                  <div className="text-green-500 text-5xl mb-4">✓</div>
                  <h2 className="text-xl font-semibold mb-2">Submission Successful!</h2>
                  <p className="text-gray-600 mb-6">Your project has been successfully submitted.</p>
                </motion.div>
              ) :
              (
                <>
                  {/* Step 1: Project Name */}
                  {
                    step === 1 && (
                      <motion.form
                        onSubmit={handleStep1(onStep1Submit)}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.p
                          variants={itemVariants}
                          className="text-center text-gray-600 mb-4 min-h-[3rem]"
                        >
                          <Typewriter text={stepTexts[1]} speed={50} delay={300} />
                        </motion.p>

                        <input
                          {...registerStep1('projectName')}
                          placeholder="What would you like to call your project?"
                          className={`w-[80%] absolute bottom-2 right-6 px-3 py-4 border rounded-md focus:outline-none focus:ring-1 ${errorsStep1.projectName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                            }`}
                        />

                        <motion.div
                          variants={itemVariants}
                          className="flex justify-center items-center absolute bottom-4 right-8"
                        >
                          <button
                            type="submit"
                            className="rounded-full px-3 py-3 transition bg-[#3A3A3A] hover:bg-[#1f1f1f]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" className="bi bi-arrow-up" viewBox="0 0 16 16">
                              <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5" />
                            </svg>
                          </button>
                        </motion.div>
                      </motion.form>
                    )
                  }

                  {/* Step 2: Analysis Description */}
                  {
                    step === 2 && (
                      <motion.form
                        className='w-full text-center'
                        onSubmit={handleStep2(onStep2Submit)}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <p
                          className="text-lg font-semibold mb-2 text-center flex items-center gap-4 w-[50%] m-auto pb-4 border-b justify-center"
                        >
                          <span className='bg-[#0A5216] p-1 rounded-full'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </span>
                          <span className='text-[#7C7C7C] text-[16px]'>Project Name Set</span>
                        </p>

                        <motion.p
                          variants={itemVariants}
                          className="text-center text-gray-600 mb-4 m-auto w-[95%] min-h-[2.5rem]"
                        >
                          <Typewriter text={stepTexts[2]} speed={30} delay={300} />
                        </motion.p>

                        <input
                          {...registerStep2('analysisDescription')}
                          placeholder="Write in detail what you want to analyse"
                          className={`w-[80%] absolute bottom-2 right-6 px-3 py-4 border rounded-md focus:outline-none focus:ring-1 ${errorsStep2.analysisDescription ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                            }`}
                        />
                        <motion.div
                          variants={itemVariants}
                          className="flex justify-center items-center absolute bottom-4 right-8"
                        >
                          <button
                            type="submit"
                            className="rounded-full px-3 py-3 transition bg-[#3A3A3A] hover:bg-[#1f1f1f]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" className="bi bi-arrow-up" viewBox="0 0 16 16">
                              <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5" />
                            </svg>
                          </button>
                        </motion.div>
                      </motion.form>
                    )}

                  {/* Step 3: File Upload */}
                  {step === 3 && (
                    <motion.div
                      className='pb-4 flex items-center flex-col justify-center'
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <p
                        className="text-lg mb-2 text-center flex items-center gap-4 justify-center"
                      >
                        <span className='bg-[#0A5216] p-1 rounded-full'>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <span className='text-[#7C7C7C] text-[16px]'>Project Name Set</span>
                      </p>

                      <p
                        className="text-lg mb-2 mt-8 text-center flex items-center ml-2 gap-4 pb-4 justify-center"
                      >
                        <span className='bg-[#0A5216] p-1 rounded-full'>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <span className='text-[#7C7C7C] text-[16px]'>Analysis Description</span>
                      </p>

                      <motion.p
                        variants={itemVariants}
                        className="text-center text-gray-600 mb-4 min-h-[3rem]"
                      >
                        <Typewriter text={stepTexts[3]} speed={30} delay={300} />
                      </motion.p>
                        <input
                          type="file"
                          id="file-upload"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload"
                          className="w-[80%] m-auto mt-6 block border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:border-blue-400 transition"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          <p className="text-gray-600 font-medium">DRAG AND DROP YOUR FILES</p>
                          </div>
                        </label>

                        {files.length > 0 && (
                          <div className="w-[80%] m-auto mt-4 bg-gray-50 p-3 rounded-md">
                            <p className="text-sm font-medium text-gray-700 mb-1">Selected files:</p>
                            <ul className="text-sm text-gray-600">
                              {files.map((file, index) => (
                                <li key={index} className="truncate">
                                  {file.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-center mt-4"
                      >
                        <div className="space-x-2 flex items-center justify-center m-auto w-[80%]">
                          {files.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setStep(4)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition m-auto"
                            >
                              Next
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSkipFiles}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition m-auto"
                            >
                              SKIP
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 4: Review and Submit */}
                  {step === 4 && (
                    <motion.div
                      className='pb-4'
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <p
                        className="text-lg mb-2 text-center flex items-center gap-4 justify-center"
                      >
                        <span className='bg-[#0A5216] p-1 rounded-full'>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <span className='text-[#7C7C7C] text-[16px]'>Project Name Set</span>
                      </p>

                      <p
                        className="text-lg mb-2 mt-8 text-center flex items-center ml-2 gap-4 pb-4 justify-center"
                      >
                        <span className='bg-[#0A5216] p-1 rounded-full'>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <span className='text-[#7C7C7C] text-[16px]'>Analysis Description</span>
                      </p>

                      <motion.p
                        variants={itemVariants}
                        className="text-center text-gray-600 mb-4 min-h-[3rem]"
                      >
                        <Typewriter text={stepTexts[4]} speed={30} delay={300} />
                      </motion.p>

                      <motion.div
                        variants={itemVariants}
                        className="w-[60%] h-52 mx-auto mt-8 bg-gray-50 p-4 rounded-md flex justify-start items-start border-dashed border-2 border-gray-300"
                      >
                        {files.length > 0 ? (
                          <div className="flex text-center flex-col justify-center items-center p-2">
                            <div className="rounded-md text-center">
                              <img src={fileIcon} width={20} alt="" />
                            </div>
                            <div>
                              <p className="text-sm text-center font-medium text-gray-700">{files[0].name}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <p>No files uploaded</p>
                          </div>
                        )}
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex justify-center mt-8"
                      >
                        <button
                          onClick={onSubmit}
                          className="bg-[#F5F5F5] text-[#303030] px-6 py-2 rounded-md font-semibold hover:bg-[#F5F5F9] transition"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'DONE'}
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </>
              )}
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;