import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';

export const useLibraryLoader = () => {
  const [librariesLoaded, setLibrariesLoaded] = useState(false);

  useEffect(() => {
    const loadScript = (src, globalName) => {
      return new Promise((resolve, reject) => {
        if (window[globalName]) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${globalName}`));
        document.head.appendChild(script);
      });
    };

    const loadLibraries = async () => {
      try {
        await loadScript(
          'https://cdn.jsdelivr.net/npm/browser-id3-writer@4.4.0/dist/browser-id3-writer.min.js',
          'ID3Writer'
        );
        await loadScript(
          'https://cdn.jsdelivr.net/npm/jsmediatags@3.9.5/dist/jsmediatags.min.js',
          'jsmediatags'
        );
        setLibrariesLoaded(true);
      } catch (error) {
        console.error(error);
      }
    };

    loadLibraries();
  }, []);

  return { librariesLoaded, ID3Writer: window.ID3Writer, saveAs };
};
