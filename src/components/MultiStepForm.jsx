import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';

// Form validation schemas
const projectNameSchema = yup.object().shape({
  projectName: yup.string().required('Project name is required').min(3, 'Project name must be at least 3 characters'),
});

const analysisDescriptionSchema = yup.object().shape({
  analysisDescription: yup.string().required('Analysis description is required').min(10, 'Please provide more details (at least 10 characters)'),
});

const fileUploadSchema = yup.object().shape({
  files: yup.mixed().test('fileSize', 'File size is too large', (value) => {
    if (!value || value.length === 0) return true; // Skip validation if no files
    return Array.from(value).every(file => file.size <= 5 * 1024 * 1024); // 5MB max
  }),
});

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form handlers for each step
  const { register: registerStep1, handleSubmit: handleStep1, formState: { errors: errorsStep1 }, trigger: triggerStep1 } = useForm({
    resolver: yupResolver(projectNameSchema),
  });

  const { register: registerStep2, handleSubmit: handleStep2, formState: { errors: errorsStep2 }, trigger: triggerStep2 } = useForm({
    resolver: yupResolver(analysisDescriptionSchema),
  });

  const { register: registerStep3, handleSubmit: handleStep3, formState: { errors: errorsStep3 } } = useForm({
    resolver: yupResolver(fileUploadSchema),
  });

  const handleFileChange = (e) => {
    setUploadedFiles(Array.from(e.target.files));
  };

  const onStep1Submit = async (data) => {
    const isValid = await triggerStep1();
    if (isValid) {
      setStep(2);
    }
  };

  const onStep2Submit = async (data) => {
    const isValid = await triggerStep2();
    if (isValid) {
      setStep(3);
    }
  };

  const onStep3Submit = async () => {
    // Combine all form data (in a real app, you would collect this from all steps)
    const formData = new FormData();

    // Add files if any were uploaded
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Make the Axios call to your backend
      const response = await axios.post('https://your-api-endpoint.com/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitSuccess(true);
      console.log('Submission successful:', response.data);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'An error occurred while submitting the form');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipFiles = () => {
    setStep(4); // Skip to the final step
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${step === stepNumber ? 'bg-blue-600 text-white' :
                step > stepNumber ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
          >
            {stepNumber}
          </div>
          {stepNumber < 4 && (
            <div className={`w-16 h-1 ${step > stepNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome to P-Y25</h1>

        {renderStepIndicator()}

        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold mb-2">Submission Successful!</h2>
            <p className="text-gray-600 mb-6">Your project has been successfully submitted.</p>
            <button
              onClick={() => {
                setStep(1);
                setSubmitSuccess(false);
                setUploadedFiles([]);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Start New Project
            </button>
          </div>
        ) : (
          <>
            {step === 1 && (
              <form onSubmit={handleStep1(onStep1Submit)}>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Project Name Set</h2>
                  <input
                    type="text"
                    {...registerStep1('projectName')}
                    placeholder="Enter your project name"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errorsStep1.projectName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                  />
                  {errorsStep1.projectName && (
                    <p className="mt-1 text-sm text-red-600">{errorsStep1.projectName.message}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleStep2(onStep2Submit)}>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Analysis Description</h2>
                  <p className="text-gray-600 mb-4">Great! That's a great name, now let's try to understand what are you trying to understand a little better. Can you try to explain exactly what you are trying to analyse.</p>
                  <textarea
                    {...registerStep2('analysisDescription')}
                    placeholder="Write in detail what you want to analyse"
                    rows={5}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errorsStep2.analysisDescription ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                  />
                  {errorsStep2.analysisDescription && (
                    <p className="mt-1 text-sm text-red-600">{errorsStep2.analysisDescription.message}</p>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleStep3(onStep3Submit)}>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">File Upload</h2>
                  <p className="text-gray-600 mb-4">Are there any files you would like to upload related to this, that might help me with this analysis?</p>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      {...registerStep3('files')}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer block"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600 mb-1">DRAG AND DROP YOUR FILES</p>
                        <p className="text-sm text-gray-500">or click to browse</p>
                      </div>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">Selected files:</p>
                      <ul className="mt-1">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {errorsStep3.files && (
                    <p className="mt-1 text-sm text-red-600">{errorsStep3.files.message}</p>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition"
                  >
                    Back
                  </button>
                  <div className="space-x-3">
                    <button
                      type="button"
                      onClick={handleSkipFiles}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
                    >
                      SKIP
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Done'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {step === 4 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Review and Submit</h2>
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">Project Summary</h3>
                    {/* In a real app, you would display the collected data here */}
                    <p className="text-gray-600">Ready to submit your project information.</p>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium text-gray-700">Files to be uploaded:</p>
                        <ul className="list-disc list-inside text-gray-600">
                          {uploadedFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={onStep3Submit}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Project'}
                  </button>
                </div>
                {submitError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {submitError}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;