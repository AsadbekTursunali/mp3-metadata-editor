import React, { useState, useEffect } from 'react';
import Header from './Header';
import FileUpload from './FileUpload';
import CoverImageUpload from './CoverImageUpload';
import ArtistEditor from './ArtistEditor';
import AlbumEditor from './AlbumEditor';
import StatusMessage from './StatusMessage';
import ActionButtons from './ActionButtons';
import Instructions from './Instructions';
import ProcessingModal from './ProcessingModal';
import { useTelegramApp } from '../hooks/useTelegramApp';
import { useLibraryLoader } from '../hooks/useLibraryLoader';

const Mp3MetadataEditor = () => {
  // State
  const [mp3File, setMp3File] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [originalArtist, setOriginalArtist] = useState('');
  const [originalAlbum, setOriginalAlbum] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [status, setStatus] = useState('');
  const [processedFile, setProcessedFile] = useState(null); // Yangi state
  const [processedFilename, setProcessedFilename] = useState(''); // Yangi state

  // Custom hooks
  const { 
    isTelegramApp, 
    user, 
    sendTelegramData, 
    sendFileToBot, 
    showAlert, 
    showConfirm 
  } = useTelegramApp();
  const { librariesLoaded } = useLibraryLoader();

  const handleMp3Upload = async (file) => {
    if (file && file.type === 'audio/mpeg') {
      setMp3File(file);
      setProcessedFile(null); // Reset processed file
      setStatus('MP3 file loaded, reading metadata...');
      
      try {
        if (window.jsmediatags && librariesLoaded) {
          window.jsmediatags.read(file, {
            onSuccess: (tag) => {
              const tags = tag.tags;
              const existingArtist = tags.artist || '';
              const existingAlbum = tags.album || '';
              
              setOriginalArtist(existingArtist);
              setOriginalAlbum(existingAlbum);
              
              if (!artist) setArtist(existingArtist);
              if (!album) setAlbum(existingAlbum);
              
              setStatus('MP3 file loaded successfully with metadata');
            },
            onError: (error) => {
              console.log('Metadata read error:', error);
              setOriginalArtist('');
              setOriginalAlbum('');
              setStatus('MP3 file loaded successfully');
            }
          });
        } else {
          setOriginalArtist('');
          setOriginalAlbum('');
          setStatus('MP3 file loaded successfully');
        }
        
        sendTelegramData({
          action: 'file_uploaded',
          filename: file.name,
          size: file.size,
          user_id: user?.id
        });
      } catch (error) {
        console.error('Error reading metadata:', error);
        setStatus('MP3 file loaded (metadata reading unavailable)');
      }
    } else {
      setStatus('Please select a valid MP3 file');
    }
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setCoverImage(file);
      setStatus('Cover image loaded successfully');
    } else {
      setStatus('Please select a valid image file');
    }
  };

  const processFile = async () => {
    if (!mp3File) {
      setStatus('Please upload an MP3 file first');
      showAlert('Please upload an MP3 file first');
      return;
    }

    if (!librariesLoaded) {
      setStatus('Please wait for libraries to load, then try again');
      showAlert('Please wait for libraries to load, then try again');
      return;
    }

    setIsProcessing(true);
    setStatus('Processing file...');

    try {
      // Step 1: Check ID3Writer
      setProcessingStep('Initializing audio processor...');
      if (!window.ID3Writer) {
        throw new Error('ID3Writer library not loaded');
      }

      // Step 2: Read file
      setProcessingStep('Reading MP3 file...');
      const arrayBuffer = await mp3File.arrayBuffer();
      const writer = new window.ID3Writer(arrayBuffer);
      
      // Step 3: Set metadata
      setProcessingStep('Writing metadata...');
      if (artist.trim()) {
        writer.setFrame('TPE1', [artist.trim()]);
      }
      
      if (album.trim()) {
        writer.setFrame('TALB', album.trim());
      }
      
      // Step 4: Process cover image
      if (coverImage) {
        setProcessingStep('Processing cover image...');
        const imageBuffer = await coverImage.arrayBuffer();
        const imageUint8Array = new Uint8Array(imageBuffer);
        writer.setFrame('APIC', {
          type: 3,
          data: imageUint8Array,
          description: 'Cover',
          useUnicodeEncoding: false
        });
      }
      
      // Step 5: Generate final file
      setProcessingStep('Generating final MP3...');
      writer.addTag();
      const taggedSongBuffer = writer.getBlob();
      const blob = new Blob([taggedSongBuffer], { type: 'audio/mpeg' });
      
      // Step 6: Prepare filename
      const filename = `${artist || 'Unknown Artist'} - ${album || 'Unknown Album'}.mp3`;
      
      // Save processed file to state instead of sending immediately
      setProcessedFile(blob);
      setProcessedFilename(filename);
      setStatus('✅ File processed successfully! Ready to download.');
      
      sendTelegramData({
        action: 'file_processed',
        artist: artist,
        album: album,
        filename: filename,
        original_filename: mp3File.name,
        file_size: blob.size,
        user_id: user?.id,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Processing error:', error);
      const errorMessage = `❌ Error: ${error.message}`;
      setStatus(errorMessage);
      showAlert(errorMessage);
      
      sendTelegramData({
        action: 'file_processed_error',
        error: error.message,
        user_id: user?.id,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const downloadFile = async () => {
    if (!processedFile) {
      showAlert('No processed file available');
      return;
    }

    showConfirm(
      `Send "${processedFilename}" to your Telegram chat?`,
      async (confirmed) => {
        if (!confirmed) return;

        setStatus('Sending to Telegram...');

        try {
          const result = await sendFileToBot(processedFile, processedFilename, {
            artist: artist,
            album: album,
            originalFilename: mp3File.name
          });

          if (result.success) {
            setStatus('✅ File sent to Telegram successfully!');
            showAlert('🎵 Your processed MP3 has been sent to the chat!');
            
            sendTelegramData({
              action: 'file_sent_success',
              artist: artist,
              album: album,
              filename: processedFilename,
              user_id: user?.id,
              timestamp: new Date().toISOString()
            });
          } else {
            throw new Error(result.message || 'Failed to send file');
          }
          
        } catch (error) {
          console.error('Download error:', error);
          const errorMessage = `❌ Error: ${error.message}`;
          setStatus(errorMessage);
          showAlert(errorMessage);
          
          sendTelegramData({
            action: 'file_sent_error',
            error: error.message,
            user_id: user?.id,
            timestamp: new Date().toISOString()
          });
        }
      }
    );
  };

  const resetAll = () => {
    showConfirm('Clear all data?', (confirmed) => {
      if (confirmed) {
        setMp3File(null);
        setCoverImage(null);
        setArtist('');
        setAlbum('');
        setOriginalArtist('');
        setOriginalAlbum('');
        setProcessedFile(null);
        setProcessedFilename('');
        setStatus('');
        
        sendTelegramData({
          action: 'reset_form',
          user_id: user?.id
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Header 
          isTelegramApp={isTelegramApp} 
          librariesLoaded={librariesLoaded} 
          user={user}
        />
        
        <FileUpload 
          mp3File={mp3File}
          onMp3Upload={handleMp3Upload}
        />
        
        <CoverImageUpload 
          coverImage={coverImage}
          onImageUpload={handleImageUpload}
        />
        
        <ArtistEditor 
          artist={artist}
          originalArtist={originalArtist}
          onArtistChange={setArtist}
        />
        
        <AlbumEditor 
          album={album}
          originalAlbum={originalAlbum}
          onAlbumChange={setAlbum}
        />
        
        <StatusMessage status={status} />
        
        {/* Updated Action Buttons with Download */}
        <div className="space-y-3 mb-6">
          <button
            onClick={processFile}
            disabled={!mp3File || isProcessing || !librariesLoaded}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 
                     text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isProcessing ? 'Processing...' : '🎵 Process MP3'}
          </button>
          
          {processedFile && (
            <button
              onClick={downloadFile}
              className="w-full bg-green-500 hover:bg-green-600 
                       text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              📤 Send to Telegram Chat
            </button>
          )}
          
          <button
            onClick={resetAll}
            disabled={isProcessing}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 
                     text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            🗑️ Reset All
          </button>
        </div>
        
        <Instructions isTelegramMode={true} />
        
        {/* Processing Modal */}
        <ProcessingModal 
          isOpen={isProcessing} 
          step={processingStep}
        />
      </div>
    </div>
  );
};

export default Mp3MetadataEditor;