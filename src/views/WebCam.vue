<template>
  <div class="display-covered grid border border-danger">
    <div class="vidWrap" style="width:160px">
      <video ref="video" autoplay playsinline width="160" height="200"></video>
      <canvas class="d-none" ref="canvas"></canvas>

      <div class="video-option col-12 my-2">
        {{ constraints.video.facingMode }}
        <select name="" id="" class="form-select form-control-sm" ref="cameraOptions" @change="cameraOptionsChanged()">
          <option value="">Select camera</option>
        </select>
      </div>

      <div class="screenshot-image mx-auto">
        <img class="img-fluid d-none" ref="screenshotImage" alt="">
      </div>
    </div>

    <div class="controled" ref="controls mb-3">
      <button class="btn btn-sm btn-danger play" ref="play" @click="playVideo" title="Play">
        Open Camera
      </button>
      <button class="btn btn-sm btn-info pause d-none" ref="pause" @click="pauseClicked" title="Pause"><i
          data-feather="pause"></i>Pause</button>
      <button class="btn btn-sm btn-outline-primary rounded-circle screenshot d-none" ref="screenshot"
        @click="screenshotClicked" title="ScreenShot">
        <Icon icon="mdi-light:camera" style="width:5em;height:5em" />
      </button>
    </div>


  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { ref, onMounted } from 'vue'

const video = ref('');
const canvas = ref('');
const screenshotImage = ref('');
const play = ref('')
const pause = ref('')
const screenshot = ref('')
let streamStarted = ref(false);
const cameraOptions = ref('');

// const face = ref('')
const constraints = {
  audio: false,
  video: {
    width: {
      ideal: 160,
    },
    height: {
      ideal: 200,
    },
  }
};

let useFrontCamera = ref(true);
const getCameraSelection = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    alert("Your device is not supported.");
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  const options = videoDevices.map(videoDevice => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });

  cameraOptions.value.innerHTML = options.join('');
};

const playVideo = () => {
  if (streamStarted.value) {
    video.value.play();
    play.value.classList.add('d-none');
    // pause.value.classList.remove('d-none');
    return;
  }
  if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
    const updatedConstraints = {
      ...constraints,
      deviceId: {
        exact: cameraOptions.value.value
      }
    };
    startStream(updatedConstraints);
  }
};

const startStream = async (constraints) => {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  handleStream(stream);
};

const handleStream = (stream) => {
  video.value.srcObject = stream;
  play.value.classList.add('d-none');
  // pause.value.classList.remove('d-none');
  screenshot.value.classList.remove('d-none');
  streamStarted.value = true;
};



const cameraOptionsChanged = () => {
  useFrontCamera.value = !useFrontCamera.value;
  constraints.video.facingMode = useFrontCamera.value ? "user" : "environment";


  const updatedConstraints = {
    ...constraints,
    deviceId: {
      exact: cameraOptions.value.value
    }
  };
  startStream(updatedConstraints);
};

const pauseStream = () => {
  // video.value.pause();
  play.value.classList.remove('d-none');
  // pause.value.classList.add('d-none');
};

const doScreenshot = () => {
  const context = canvas.value.getContext('2d')
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;

  // ***
  let aspect = video.value.videoHeight / video.value.videoWidth;
  let wantedWidth = 160;   // or use height
  let height = Math.round(wantedWidth * aspect);

  canvas.value.width = wantedWidth;
  canvas.value.height = height;
  // ***

  context.translate(canvas.value.width, 0);
  context.scale(-1, 1);
  context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
  screenshotImage.value.src = canvas.value.toDataURL('image/png');
  screenshotImage.value.classList.remove('d-none');
};

const pauseClicked = () => pauseStream();
const screenshotClicked = () => doScreenshot();

onMounted(() => {
  getCameraSelection();
})

</script>

<style scoped>
.grid {
  display: grid;
  place-items: center;
  width: 100%;
  height: 60vh;
}

.screenshot {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3px;
}

.screenshot-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  /* border: 2px solid whitesmoke; */
  /* box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1); */
  /* position: absolute;
  bottom: 5px;
  left: 10px; */
  /* background: white; */
}

.display-cover {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 70%;
  margin: 5% auto;
  position: relative;
}

video {
  object-fit: cover;
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  background: rgba(0, 0, 0, 0.2);
}

.video-options {
  position: absolute;
  left: 20px;
  top: 30px;
}

.controls {
  position: absolute;
  right: 20px;
  top: 20px;
  display: flex;
}

.controls>button {
  width: 45px;
  height: 45px;
  text-align: center;
  border-radius: 100%;
  margin: 0 6px;
  background: transparent;
}

.controls>button:hover svg {
  color: white !important;
}

@media (min-width: 300px) and (max-width: 400px) {
  .controls {
    flex-direction: column;
  }

  .controls button {
    margin: 5px 0 !important;
  }
}

.controls>button>svg {
  height: 20px;
  width: 18px;
  text-align: center;
  margin: 0 auto;
  padding: 0;
}

.controls button:nth-child(1) {
  border: 2px solid #D2002E;
}

.controls button:nth-child(1) svg {
  color: #D2002E;
}

.controls button:nth-child(2) {
  border: 2px solid #008496;
}

.controls button:nth-child(2) svg {
  color: #008496;
}

.controls button:nth-child(3) {
  border: 2px solid #00B541;
}

.controls button:nth-child(3) svg {
  color: #00B541;
}

.controls>button {
  width: 45px;
  height: 45px;
  text-align: center;
  border-radius: 100%;
  margin: 0 6px;
  background: transparent;
}

.controls>button:hover svg {
  color: white;
}
</style>