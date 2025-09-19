import React, { useState, useEffect } from 'react';
import Header from './Header';
import FileUpload from './FileUpload';
import CoverImageUpload from './CoverImageUpload';
import ArtistEditor from './ArtistEditor';
import AlbumEditor from './AlbumEditor';
import StatusMessage from './StatusMessage';
import ActionButtons from './ActionButtons';
import Instructions from './Instructions';
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
  const [status, setStatus] = useState('');

  // Custom hooks
  const { isTelegramApp, sendTelegramData } = useTelegramApp();
  const { librariesLoaded } = useLibraryLoader();

  const handleMp3Upload = async (file) => {
    if (file && file.type === 'audio/mpeg') {
      setMp3File(file);
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
      if (!window.ID3Writer) {
        throw new Error('ID3Writer library not loaded');
      }

      const arrayBuffer = await mp3File.arrayBuffer();
      const writer = new window.ID3Writer(arrayBuffer);
      
      if (artist.trim()) {
        writer.setFrame('TPE1', [artist.trim()]);
      }
      
      if (album.trim()) {
        writer.setFrame('TALB', album.trim());
      }
      
      if (coverImage) {
        const imageBuffer = await coverImage.arrayBuffer();
        const imageUint8Array = new Uint8Array(imageBuffer);
        writer.setFrame('APIC', {
          type: 3,
          data: imageUint8Array,
          description: 'Cover',
          useUnicodeEncoding: false
        });
      }
      
      writer.addTag();
      const taggedSongBuffer = writer.getBlob();
      const blob = new Blob([taggedSongBuffer], { type: 'audio/mpeg' });
      
      const filename = `${artist || 'Unknown Artist'} - ${album || 'Unknown Album'}.mp3`;
      
      if (window.saveAs) {
        window.saveAs(blob, filename);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      setStatus('File processed and downloaded successfully!');
      
      sendTelegramData({
        action: 'file_processed',
        artist: artist,
        album: album,
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
    setArtist('');
    setAlbum('');
    setOriginalArtist('');
    setOriginalAlbum('');
    setStatus('');
    
    sendTelegramData({
      action: 'reset_form'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Header 
          isTelegramApp={isTelegramApp} 
          librariesLoaded={librariesLoaded} 
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