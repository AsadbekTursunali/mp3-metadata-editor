import React, { useState } from 'react';
import Header from './Header';
import FileUpload from './FileUpload';
import CoverImageUpload from './CoverImageUpload';
import TitleEditor from './TitleEditor';
import StatusMessage from './StatusMessage';
import ActionButtons from './ActionButtons';
import Instructions from './Instructions';
import { useTelegramApp } from '../hooks/useTelegramApp';
import { useLibraryLoader } from '../hooks/useLibraryLoader';

const Mp3MetadataEditor = () => {
  const [mp3File, setMp3File] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');

  const { isTelegramApp, sendTelegramData } = useTelegramApp();
  const { librariesLoaded, ID3Writer, jsmediatags, saveAs } = useLibraryLoader();

  const handleMp3Upload = async (file) => {
    if (file && file.type === 'audio/mpeg') {
      setMp3File(file);
      setStatus('MP3 file loaded, reading metadata...');

      try {
        if (librariesLoaded) {
          jsmediatags.read(file, {
            onSuccess: (tag) => {
              const tags = tag.tags;
              const existingTitle = tags.title || file.name.replace('.mp3', '');
              setOriginalTitle(existingTitle);
              if (!title) setTitle(existingTitle);
              setStatus('MP3 file loaded successfully with metadata');
            },
            onError: () => {
              const fileName = file.name.replace('.mp3', '');
              setOriginalTitle(fileName);
              if (!title) setTitle(fileName);
              setStatus('MP3 file loaded successfully');
            }
          });
        } else {
          const fileName = file.name.replace('.mp3', '');
          setOriginalTitle(fileName);
          if (!title) setTitle(fileName);
          setStatus('MP3 file loaded successfully');
        }

        sendTelegramData({
          action: 'file_uploaded',
          filename: file.name,
          size: file.size
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
      return;
    }
    if (!librariesLoaded) {
      setStatus('Please wait for libraries to load, then try again');
      return;
    }

    setIsProcessing(true);
    setStatus('Processing file...');

    try {
      const arrayBuffer = await mp3File.arrayBuffer();
      const writer = new ID3Writer(arrayBuffer);

      if (title.trim()) writer.setFrame('TIT2', title.trim());

      if (coverImage) {
        const imageBuffer = await coverImage.arrayBuffer();
        writer.setFrame('APIC', {
          type: 3,
          data: new Uint8Array(imageBuffer),
          description: 'Cover',
          useUnicodeEncoding: false
        });
      }

      writer.addTag();
      const blob = writer.getBlob();
      saveAs(blob, `${title || 'edited'}.mp3`);

      setStatus('File processed and downloaded successfully!');
      sendTelegramData({
        action: 'file_processed',
        title: title,
        original_filename: mp3File.name,
        success: true
      });

      if (isTelegramApp && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('MP3 file processed successfully!');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setStatus('Error processing file: ' + error.message);
      sendTelegramData({
        action: 'file_processed',
        success: false,
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setMp3File(null);
    setCoverImage(null);
    setTitle('');
    setOriginalTitle('');
    setStatus('');

    sendTelegramData({
      action: 'reset_form'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Header isTelegramApp={isTelegramApp} librariesLoaded={librariesLoaded} />
        <FileUpload mp3File={mp3File} onMp3Upload={handleMp3Upload} />
        <CoverImageUpload coverImage={coverImage} onImageUpload={handleImageUpload} />
        <TitleEditor title={title} originalTitle={originalTitle} onTitleChange={setTitle} />
        <StatusMessage status={status} />
        <ActionButtons
          mp3File={mp3File}
          isProcessing={isProcessing}
          librariesLoaded={librariesLoaded}
          onProcess={processFile}
          onReset={resetAll}
        />
        <Instructions />
      </div>
    </div>
  );
};

export default Mp3MetadataEditor;
