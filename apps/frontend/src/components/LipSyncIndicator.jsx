import { useState, useEffect } from 'react';

const backendUrl = "http://localhost:3000";

export const LipSyncIndicator = () => {
  const [lipSyncStatus, setLipSyncStatus] = useState('checking');

  useEffect(() => {
    const checkLipSyncStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/lip-sync-status`);
        const data = await response.json();
        setLipSyncStatus(data.status);
      } catch (error) {
        console.error('Error checking lip sync status:', error);
        setLipSyncStatus('basic');
      }
    };

    checkLipSyncStatus();
  }, []);

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 backdrop-blur-md bg-white/50 p-2 px-3 rounded-full shadow-lg">
      {lipSyncStatus === 'full' ? (
        <>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500">
            <path d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
          <span className="text-sm font-medium text-green-700">Full Lip Sync</span>
        </>
      ) : lipSyncStatus === 'basic' ? (
        <>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-500">
            <path d="M8.4449 0.608765C8.0183 0.368015 7.50737 0.368015 7.08077 0.608765L1.99048 3.61877C1.51251 3.89069 1.21777 4.41655 1.21777 4.99351V10.0065C1.21777 10.5835 1.51251 11.1093 1.99048 11.3812L7.08077 14.3912C7.50737 14.632 8.0183 14.632 8.4449 14.3912L13.5352 11.3812C14.0132 11.1093 14.3079 10.5835 14.3079 10.0065V4.99351C14.3079 4.41655 14.0132 3.89069 13.5352 3.61877L8.4449 0.608765ZM7.58321 1.38802C7.71813 1.31177 7.80754 1.31177 7.94246 1.38802L13.0328 4.39802C13.1961 4.48902 13.3079 4.66062 13.3079 4.99351V10.0065C13.3079 10.3394 13.1961 10.511 13.0328 10.602L7.94246 13.612C7.80754 13.6882 7.71813 13.6882 7.58321 13.612L2.49291 10.602C2.32959 10.511 2.21777 10.3394 2.21777 10.0065V4.99351C2.21777 4.66062 2.32959 4.48902 2.49291 4.39802L7.58321 1.38802ZM7.76284 3.09647C7.76284 2.82033 7.53898 2.59647 7.26284 2.59647C6.98669 2.59647 6.76284 2.82033 6.76284 3.09647V7.09647C6.76284 7.37262 6.98669 7.59647 7.26284 7.59647C7.53898 7.59647 7.76284 7.37262 7.76284 7.09647V3.09647ZM7.26284 9.59647C7.53898 9.59647 7.76284 9.82033 7.76284 10.0965C7.76284 10.3726 7.53898 10.5965 7.26284 10.5965C6.98669 10.5965 6.76284 10.3726 6.76284 10.0965C6.76284 9.82033 6.98669 9.59647 7.26284 9.59647Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
          <span className="text-sm font-medium text-yellow-700">Basic Lip Sync</span>
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500 animate-spin">
            <path d="M1.90321 7.49988C1.90321 4.45089 4.37422 1.97988 7.42321 1.97988C10.4722 1.97988 12.9432 4.45089 12.9432 7.49988C12.9432 10.5489 10.4722 13.0199 7.42321 13.0199C4.37422 13.0199 1.90321 10.5489 1.90321 7.49988ZM7.42321 0.929878C3.79539 0.929878 0.853211 3.87206 0.853211 7.49988C0.853211 11.1277 3.79539 14.0699 7.42321 14.0699C11.051 14.0699 13.9932 11.1277 13.9932 7.49988C13.9932 3.87206 11.051 0.929878 7.42321 0.929878Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
          <span className="text-sm font-medium text-blue-700">Checking Lip Sync...</span>
        </>
      )}
    </div>
  );
}; 