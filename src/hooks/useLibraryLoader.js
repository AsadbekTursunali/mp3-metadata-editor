import { useState, useEffect } from 'react';

export const useLibraryLoader = () => {
  const [librariesLoaded, setLibrariesLoaded] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Loading libraries...');

  useEffect(() => {
    const loadScript = (src, name, globalVar) => {
      return new Promise((resolve, reject) => {
        // Check if already loaded by global variable
        if (window[globalVar]) {
          console.log(`${name} already loaded`);
          resolve();
          return;
        }

        // Check if script tag already exists
        if (document.querySelector(`script[data-lib="${name}"]`)) {
          // Wait a bit and check again
          setTimeout(() => {
            if (window[globalVar]) {
              resolve();
            } else {
              reject(new Error(`${name} loaded but global variable ${globalVar} not found`));
            }
          }, 1000);
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.setAttribute('data-lib', name);
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          console.log(`${name} script loaded`);
          // Check if global variable is available
          setTimeout(() => {
            if (window[globalVar]) {
              console.log(`${name} loaded successfully`);
              resolve();
            } else {
              console.error(`${name} loaded but ${globalVar} not found`);
              reject(new Error(`${name} loaded but global variable ${globalVar} not found`));
            }
          }, 100);
        };
        
        script.onerror = (error) => {
          console.error(`Failed to load ${name}:`, error);
          reject(new Error(`Failed to load ${name}`));
        };
        
        document.head.appendChild(script);
      });
    };

    const loadLibraries = async () => {
      try {
        setLoadingStatus('Loading jsmediatags...');
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js', 
          'jsmediatags',
          'jsmediatags'
        );

        setLoadingStatus('Loading ID3Writer...');
        // Try multiple CDN sources for ID3Writer
        try {
          await loadScript(
            'https://unpkg.com/browser-id3-writer@4.4.0/dist/browser-id3-writer.min.js', 
            'id3writer',
            'ID3Writer'
          );
        } catch (error) {
          console.log('Trying alternative CDN for ID3Writer...');
          await loadScript(
            'https://cdn.jsdelivr.net/npm/browser-id3-writer@4.4.0/dist/browser-id3-writer.min.js',
            'id3writer-alt',
            'ID3Writer'
          );
        }

        setLoadingStatus('Loading FileSaver...');
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js', 
          'filesaver',
          'saveAs'
        );

        console.log('All libraries loaded successfully');
        setLibrariesLoaded(true);
        setLoadingStatus('Libraries loaded successfully');
        
      } catch (error) {
        console.error('Failed to load libraries:', error);
        setLoadingStatus(`Failed to load libraries: ${error.message}`);
        
        // Try to continue with partial loading
        const partiallyLoaded = window.jsmediatags || window.ID3Writer || window.saveAs;
        if (partiallyLoaded) {
          console.log('Some libraries loaded, continuing with partial functionality');
          setLibrariesLoaded(true);
          setLoadingStatus('Some libraries loaded - Limited functionality available');
        }
      }
    };

    loadLibraries();
  }, []);

  return { librariesLoaded, loadingStatus };
};