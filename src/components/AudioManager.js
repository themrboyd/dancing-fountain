import React, { useEffect, useRef, useState, useCallback } from 'react';

const SONGS = [
  { name: "Song 1", path: "/music/spa1.mp3" },
  { name: "Song 2", path: "/music/science-documentary-169621.mp3" },
  
  // เพิ่มเพลงอื่นๆ ตามต้องการ
];

// ฟังก์ชัน throttle เพื่อจำกัดความถี่ในการเรียก callback
function throttle(callback, limit) {
  let waiting = false;
  return function () {
    if (!waiting) {
      callback.apply(this, arguments);
      waiting = true;
      setTimeout(function () {
        waiting = false;
      }, limit);
    }
  }
}

const AudioManager = ({ onAudioData }) => {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const audioDataRef = useRef(new Uint8Array(1024));
  const onAudioDataRef = useRef(onAudioData);
  const animationFrameRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);

  const lowPassRef = useRef(null);
  const highPassRef = useRef(null);
  const lastAudioDataRef = useRef(new Float32Array(4));

  // อัปเดต ref เมื่อ prop เปลี่ยน
  useEffect(() => {
    onAudioDataRef.current = onAudioData;
  }, [onAudioData]);

  const updateAudioData = useCallback(() => {
    if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
  
        // วิเคราะห์ย่านความถี่ต่างๆ
        const bassAvg = average(dataArray.slice(0, 10));
        const midAvg = average(dataArray.slice(10, 100));
        const trebleAvg = average(dataArray.slice(100, 200));
        const overallAvg = average(dataArray);
  
        // ทำให้การเปลี่ยนแปลงนุ่มนวลขึ้น
        const smoothedData = smoothData([bassAvg, midAvg, trebleAvg, overallAvg]);
  
        // ส่งข้อมูลที่วิเคราะห์แล้วไปยัง DancingFountain
        onAudioDataRef.current(smoothedData);
      }
    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, []);

  // ฟังก์ชันสำหรับคำนวณค่าเฉลี่ย
  const average = (array) => array.reduce((a, b) => a + b) / array.length;

  // ฟังก์ชันสำหรับทำให้การเปลี่ยนแปลงนุ่มนวล
  const smoothData = (newData) => {
    const smoothFactor = 0.8;
    const smoothedData = new Float32Array(4);
    for (let i = 0; i < 4; i++) {
      smoothedData[i] = smoothFactor * lastAudioDataRef.current[i] + (1 - smoothFactor) * newData[i];
    }
    lastAudioDataRef.current = smoothedData;
    return smoothedData;
  };
  
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;

       // สร้าง low-pass และ high-pass filters
       lowPassRef.current = audioContextRef.current.createBiquadFilter();
       lowPassRef.current.type = 'lowpass';
       lowPassRef.current.frequency.setValueAtTime(200, audioContextRef.current.currentTime);
   
       highPassRef.current = audioContextRef.current.createBiquadFilter();
       highPassRef.current.type = 'highpass';
       highPassRef.current.frequency.setValueAtTime(2000, audioContextRef.current.currentTime);

       
    updateAudioData();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [updateAudioData]);

  const loadAudio = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      decodeAudioData(event.target.result);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const loadPredefinedAudio = useCallback((songPath) => {
    fetch(songPath)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => decodeAudioData(arrayBuffer))
      .catch(error => console.error("Error loading audio:", error));
  }, []);

  const decodeAudioData = useCallback((arrayBuffer) => {
    audioContextRef.current.decodeAudioData(arrayBuffer, (buffer) => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      sourceRef.current = audioContextRef.current.createBufferSource();
      sourceRef.current.buffer = buffer;
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      sourceRef.current.start(0);
      setIsPlaying(true);
    });
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      sourceRef.current.stop();
      setIsPlaying(false);
    } else if (sourceRef.current && sourceRef.current.buffer) {
      sourceRef.current = audioContextRef.current.createBufferSource();
      sourceRef.current.buffer = sourceRef.current.buffer;
      sourceRef.current.connect(analyserRef.current);
      sourceRef.current.start(0);
      setIsPlaying(true);
    }
  }, [isPlaying]);

  return (
    <div>
      <select 
        onChange={(e) => {
          setCurrentSong(e.target.value);
          loadPredefinedAudio(e.target.value);
        }} 
        value={currentSong || ""}
      >
        <option value="">Select a song</option>
        {SONGS.map((song, index) => (
          <option key={index} value={song.path}>{song.name}</option>
        ))}
      </select>
      <input type="file" accept="audio/*" onChange={(e) => loadAudio(e.target.files[0])} />
      <button onClick={togglePlayback}>{isPlaying ? 'Pause' : 'Play'}</button>
    </div>
  );
};

export default AudioManager;