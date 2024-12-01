//?========================variables=========================
let positionInPlaylist = 1; //current position in playlist(songNumber)
let loopBtnClicksCount = 0;
let trackRepeat = false;
let playlistRepeat = false;
let shuffle = false;
let defaultPlaylistPlaying = true;
let favoritePlaylistPlaying = false;
let filePathsArr = [];
let shuffledPlaylist = [];
let playlistMetadata = [];
let favoritePlaylistMetadata = [];
let favoritePlaylist = [];
let currentPlaylist = [];
const playerBody = document.getElementById("playerBody");
const toggleSidebar = document.getElementById("toggleSidebar");
const toggleAbout = document.getElementById("toggleAbout");
const headPartPopover = document.getElementById("headPartPopover");
const coverPart = document.getElementById("coverPart");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const progressBar = document.getElementById("progressBar");
const track = document.getElementById("track");
const audioSource = document.getElementById("audioSource");
const toggleFXBtn = document.getElementById("toggleFX");
const toggleFavoriteBtn = document.getElementById("toggleFavoriteBtn");
const togglePlaylist = document.getElementById("togglePlaylist");
const togglePlayBtn = document.getElementById("togglePlayBtn");
const currentTime = document.getElementById('currentTime');
const songDuration = document.getElementById('songDuration');
const playIcon = document.getElementById("playIcon");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const devPopUpBtn = document.getElementById('devPopUpBtn');
const devPopUpClose = document.getElementById('devPopUpClose');
const aboutDevPopUp = document.getElementById('aboutDevPopUp');

// sidebar elements=========================
const sidebar = document.getElementById("sidebar");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const sidebarMisc = document.getElementById("sidebarMisc");
const skinCollection = document.getElementById('skinCollection');

// playlist page elements===================
const PlaylistPage = document.getElementById("PlaylistPage");
const backBtn = document.getElementById("backBtn");
const toggleThemeBtn = document.getElementById("toggleThemeBtn");
const defPlaylistBtn = document.getElementById("defPlaylistBtn");
const favPlaylistBtn = document.getElementById("favPlaylistBtn");
const themePalette = document.getElementById("themePalette");
const trackCount = document.getElementById("trackCount");
const playlistBody = document.getElementById("playlistBody");
const favouritePlaylistBody = document.getElementById("favouritePlaylistBody");

//?===================helper functions========================
function updateMetadataFromCollection() {
  if (favoritePlaylistPlaying) {
    title.textContent = favoritePlaylistMetadata[positionInPlaylist - 1].title;
    artist.textContent = favoritePlaylistMetadata[positionInPlaylist - 1].artist;
    if (favoritePlaylistMetadata[positionInPlaylist - 1].pictureLink) {
      coverPart.style.backgroundImage = `url(${favoritePlaylistMetadata[positionInPlaylist - 1].pictureLink})`;
      playerBody.style.backgroundImage = `url(${favoritePlaylistMetadata[positionInPlaylist - 1].pictureLink})`;
    } else {
      //show a defaullt thumbanil
      coverPart.style.backgroundImage = `url(../images/thumbnail_default.jpg)`;
      playerBody.style.backgroundImage = `url(../images/thumbnail_default.jpg)`;
    }
  } else {
    title.textContent = playlistMetadata[positionInPlaylist - 1].title;
    artist.textContent = playlistMetadata[positionInPlaylist - 1].artist;
    if (playlistMetadata[positionInPlaylist - 1].pictureLink) {
      coverPart.style.backgroundImage = `url(${playlistMetadata[positionInPlaylist - 1].pictureLink})`;
      playerBody.style.backgroundImage = `url(${playlistMetadata[positionInPlaylist - 1].pictureLink})`;
    } else {
      //show a defaullt thumbanil
      coverPart.style.backgroundImage = `url(../images/thumbnail_default.jpg)`;
      playerBody.style.backgroundImage = `url(../images/thumbnail_default.jpg)`;
    }
  }
}

//fetch the tracks metadata then display on DOM===
function updateMetaData() {
  // Ensure the audio source has a valid MP3 file path
  if (audioSource.src) {
    // Fetch the MP3 file as a Blob
    fetch(audioSource.src)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch the MP3 file.");
        return response.blob(); // Convert response to Blob
      })
      .then((blob) => {
        // Use jsmediatags to read metadata
        jsmediatags.read(blob, {
          onSuccess: function (tag) {
            // Extract metadata
            const title = tag.tags.title || "Unknown Title";
            const artist = tag.tags.artist || "Unknown Artist";
            const picture = tag.tags.picture;

            // Display metadata
            document.getElementById("title").textContent = title;
            document.getElementById("artist").textContent = artist;

            // Display thumbnail if available
            if (picture) {
              const base64String = btoa(
                new Uint8Array(picture.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
              );
              const imgUrl = `data:${picture.format};base64,${base64String}`;
              const thumbnail = document.getElementById("thumbnail");
              coverPart.style.backgroundImage = `url(${imgUrl})`;
              playerBody.style.backgroundImage = `url(${imgUrl})`;
            } else {
              //show a defaullt thumbanil
              coverPart.style.backgroundImage = `url(../images/thumbnail_default.jpg)`;
              playerBody.style.backgroundImage = `url(../images/thumbnail_default.jpg)`;
            }
          },
          onError: function (error) {
            console.error("Error reading metadata:", error);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching MP3 file:", error);
      });
  } else {
    console.error("No MP3 source found in the <audio> element.");
  }
}

// update metaData on playlist==================
function populateMetadataCollection(filePaths) {
  return new Promise((resolve, reject) => {
    const metadataPromises = filePaths.map((filePath) => {
      return fetch(filePath)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch the MP3 file.");
          return response.blob();
        })
        .then((blob) => {
          return new Promise((resolve, reject) => {
            jsmediatags.read(blob, {
              onSuccess: function (tag) {
                const title = tag.tags.title || "Unknown Title";
                const artist = tag.tags.artist || "Unknown Artist";
                const picture = tag.tags.picture;

                // Preparing metadata object
                const metadata = {
                  title,
                  artist,
                  pictureLink: picture
                    ? `data:${picture.format};base64,${btoa(
                        new Uint8Array(picture.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
                      )}`
                    : `url(./images/playlist_thumbnail_default.png)`,
                };

                resolve(metadata);
              },
              onError: function (error) {
                reject("Error reading metadata: " + error);
              },
            });
          });
        });
    });

    Promise.all(metadataPromises)
      .then((metadataCollection) => resolve(metadataCollection))
      .catch((error) => reject(error));
  });
}

//load the first song===========================
function loadFirstSong() {
  console.log("loading first song...");
  audioSource.src = currentPlaylist[0];
  track.load();
  updateMetaData();
  positionInPlaylist = 1;
}
// fetching metadata and updating playlist=== ===
async function collectPlaylistMetadata() {
  const collection = await populateMetadataCollection(currentPlaylist);
  console.log("collection is fully loaded");
  playlistMetadata = [...collection];
  for (let item of playlistMetadata) {
    //creating elements for playlist
    const playlistItem = document.createElement("div");
    playlistItem.classList.add("playlistTrackItem", "py-3", "d-flex", "align-items-center", "pointer");
    playlistItem.setAttribute("index", `${playlistMetadata.indexOf(item)}`);
    const thumbnail = document.createElement("img");
    thumbnail.classList.add("--playlistThumbMod", "mt-1", "me-3");
    thumbnail.style.pointerEvents = "none";
    thumbnail.src = item.pictureLink;
    const trackDetails = document.createElement("div");
    trackDetails.style.pointerEvents = "none";
    const title = document.createElement("p");
    title.classList.add("playlistTrackItemDetails__Title", "m-0");
    title.textContent = item.title;
    const artist = document.createElement("p");
    artist.classList.add("playlistTrackItemDetails__Artist", "m-0");
    artist.textContent = item.artist;
    //appending elements
    trackDetails.appendChild(title);
    trackDetails.appendChild(artist);
    playlistItem.appendChild(thumbnail);
    playlistItem.appendChild(trackDetails);
    playlistBody.appendChild(playlistItem);
  }
}

//play/pause icon switch functions==============
function addPauseIcon() {
  playIcon.classList.remove("fa-play");
  playIcon.classList.add("fa-pause");
}
function addPlayIcon() {
  playIcon.classList.remove("fa-pause");
  playIcon.classList.add("fa-play");
}

//format seconds in minutes=====================
function formatSeconds(totalSeconds) {
  const seconds = Math.floor(Math.abs(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

//load the updated source and play==============
function trackLoadAndPlay() {
  if (audioSource.src === undefined) {
    // * counter-measures: if src is not found load the first song
    audioSource = currentPlaylist[0];
    positionInPlaylist = 1; //!track
  }
  track.load();
  updateMetadataFromCollection();
  track.play();
  addPauseIcon();
}

//switch to next song based on repeat conditions===
function nextSong() {
  if (positionInPlaylist >= currentPlaylist.length && playlistRepeat) {
    loadFirstSong();
    track.play();
    addPauseIcon();
  } else if (positionInPlaylist >= currentPlaylist.length) {
    loadFirstSong();
    addPlayIcon();
  } else {
    if (shuffle) {
      playRandomSong();
    } else {
      if (audioSource.src === undefined || null ) {
        // * counter-measures: if src is not found load the first song
        audioSource = currentPlaylist[0];
        positionInPlaylist = 1; //!track
      }
      audioSource.src = currentPlaylist[positionInPlaylist];
      updateMetadataFromCollection()
      positionInPlaylist++;
      trackLoadAndPlay();
    }
  }
}

//play random song (shuffle helper)==============
function playRandomSong() {
  //storing randomely generated index inside an array for later use
  let randomIndex = [];
  randomIndex.push(Math.floor(Math.random() * currentPlaylist.length));

  //* counter-measures if same song is randomely chosen next===
  if (randomIndex[0] === positionInPlaylist - 1) {
    if (randomIndex[0] === currentPlaylist.length - 1 && positionInPlaylist === currentPlaylist.length) {
      audioSource.src = currentPlaylist[randomIndex[0] - 1];
      positionInPlaylist = randomIndex[0]; //adjusting position based on random index;
    } else if (randomIndex === 0 && positionInPlaylist === 1) {
      audioSource.src = currentPlaylist[randomIndex[0] + 1];
      positionInPlaylist = randomIndex[0] + 2;
    } else {
      if (Math.random() > 0.5) {
        audioSource.src = currentPlaylist[randomIndex[0] - 1];
        positionInPlaylist = randomIndex[0];
      } else {
        audioSource.src = currentPlaylist[randomIndex[0] + 1];
        positionInPlaylist = randomIndex[0] + 2;
      }
    }
  }
  //else play the randomely picked song
  else {
    audioSource.src = currentPlaylist[randomIndex[0]]; //playing from random index
    positionInPlaylist = randomIndex[0] + 1; //adjusting position based on random index;
  }
  trackLoadAndPlay();
}
function addFavoriteMark() {
  toggleFavoriteBtn.classList.remove("fa-regular");
  togglePlayBtn.classList.add("fa-solid");
}
function removeFavoriteMark() {
  toggleFavoriteBtn.classList.add("fa-regular");
  togglePlayBtn.classList.remove("fa-solid");
}
function checkIfFavorite() {
  if (!favoritePlaylist.includes(currentPlaylist[positionInPlaylist - 1])) {
    removeFavoriteMark();
  } else addFavoriteMark();
}

//?=======================processes==============================
// === === === Operations after async data fetch === === ===
fetch("filePaths.json")
  .then((response) => response.json())
  .then((filePaths) => {
    filePathsArr = filePaths;
    currentPlaylist = [...filePathsArr];
    loadFirstSong(); //instantly load first song after scanning
    collectPlaylistMetadata(); //collects metadata for the playlist
    trackCount.textContent = currentPlaylist.length;
  })
  .catch((error) => {
    console.error("Error fetching file paths:", error);
  });

//setting up progressbar========================
track.onloadedmetadata = function () {
  progressBar.max = track.duration;
  progressBar.value = track.currentTime;
  songDuration.textContent = formatSeconds(track.duration);
};

//toggle Sidebar================================
toggleSidebar.addEventListener("click", () => {
  sidebar.style.transform = "translateX(0%)";
});
closeSidebarBtn.addEventListener("click", () => {
  sidebar.style.transform = "translateX(-100%)";
  skinCollection.style.transform = 'translateY(110%)'
});

function toggleHeadPopOver() {
  headPartPopover.classList.toggle("toggleVisibility");
  toggleAbout.classList.toggle("fa-ellipsis-vertical");
  toggleAbout.classList.toggle("fa-xmark");
  toggleAbout.classList.toggle("ps-2");
  toggleAbout.classList.toggle("toggleActive");
}

//toggle header popover=========================
toggleAbout.addEventListener("click", () => {
  toggleHeadPopOver();
});

//about dev pop up=======================================
devPopUpBtn.addEventListener('click', () => {
  aboutDevPopUp.style = 'transform: translate(5.5%, 0%); opacity: 1';
  aboutDevPopUp.style.background = PlaylistPage.style.background; //force-apply theme color
  toggleHeadPopOver();
})
devPopUpClose.addEventListener('click', () => {
  aboutDevPopUp.style = 'transform: translate(5.5%, 120%); opacity: 0';
})


// play-pause control===========================
togglePlayBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  if (playIcon.classList.contains("fa-pause")) {
    addPlayIcon();
    track.pause();
  } else {
    addPauseIcon();
    track.play();
  }
});

// progressbar grows with the song played========
if (track.play()) {
  setInterval(() => {
    progressBar.value = track.currentTime;
    currentTime.textContent = formatSeconds(track.currentTime);
  }, 500);
}

// manipulating progressbar changes current song's time
progressBar.onchange = function () {
  track.play();
  track.currentTime = progressBar.value;
  addPauseIcon();
};

//actions when a track ends======================
track.addEventListener("ended", () => {
  if (trackRepeat) {
    audioSource.src = currentPlaylist[positionInPlaylist - 1];
    trackLoadAndPlay();
  } else nextSong();
});

//toggle equalizer ==============================
toggleFXBtn.addEventListener("click", () => {
  alert("Feature is under developement.");
});

// adding or removing track to favourites=======================
toggleFavoriteBtn.addEventListener("click", () => {
  let currentSongPath = currentPlaylist[positionInPlaylist - 1];
  if (favoritePlaylist.includes(currentSongPath)) {
    Array.from(favouritePlaylistBody.children)[favoritePlaylist.indexOf(currentSongPath)].remove();
    favoritePlaylist.splice(favoritePlaylist.indexOf(currentSongPath), 1); //remove if already exists in favorite playlist
    currentPlaylist.splice(currentPlaylist.indexOf(currentSongPath), 1); //remove from current playlist
    removeFavoriteMark();
    // // ! this part below causing a bug - investigate
    // favoritePlaylistMetadata.splice(favoritePlaylistMetadata.indexOf(favoritePlaylistMetadata[positionInPlaylist]), 1);
    for(let item of favoritePlaylistMetadata) {
      if(item.title === document.getElementById('title').textContent) {
        favoritePlaylistMetadata.splice(favoritePlaylistMetadata.indexOf(item), 1);
      }
    }
    // if(favoritePlaylistPlaying) positionInPlaylist--;
  } else {
    favoritePlaylist.push(currentSongPath);
    addFavoriteMark();
    favoritePlaylistMetadata.push(playlistMetadata[positionInPlaylist - 1]);
    let clonedElement = Array.from(playlistBody.children)[positionInPlaylist].cloneNode(true); //incrementing index considering the favourite playlist body is the default first element inside playlistbody
    clonedElement.style.opacity = 1; //setting defauly opacity to 1 if it's cloned from a 0 opacity element [bugfix]
    favouritePlaylistBody.appendChild(clonedElement);
  }
});

//toggling playlist=================================
togglePlaylist.addEventListener("click", () => {
  PlaylistPage.style.transform = "translateX(0px)";
});
backBtn.addEventListener("click", () => {
  PlaylistPage.style.transform = "translateX(100%)";
});

// actions of pressing next button==================
nextBtn.addEventListener("click", () => {
  nextSong();
  checkIfFavorite();
});

// actions of pressing prev button==================
prevBtn.addEventListener("click", () => {
  // if prevBtn is pressed while the first track of the playlist is on load, switch to the last track of the playlist.
  if (positionInPlaylist === 1) {
    audioSource.src = currentPlaylist[currentPlaylist.length - 1];
    positionInPlaylist = currentPlaylist.length;
    trackLoadAndPlay();
  } else if (shuffle) {
    playRandomSong();
  } else {
    audioSource.src = currentPlaylist[positionInPlaylist - 2];
    positionInPlaylist--;
    trackLoadAndPlay();
  }
  checkIfFavorite();
});

//handling loop ========================================
repeatBtn.addEventListener("click", () => {
  loopBtnClicksCount++;
  if (loopBtnClicksCount === 1) {
    playlistRepeat = true;
  } else if (loopBtnClicksCount === 2) {
    playlistRepeat = false;
    trackRepeat = true;
    repeatBtn.classList.remove("fa-repeat");
    repeatBtn.classList.add("fa-repeat-1");
  } else {
    loopBtnClicksCount = 0;
    playlistRepeat = false;
    trackRepeat = false;
    repeatBtn.classList.add("fa-repeat");
    repeatBtn.classList.remove("fa-repeat-1");
  }
});

//handling shuffle=======================================
shuffleBtn.addEventListener("click", () => {
  if (shuffle) {
    shuffle = false;
    shuffleBtn.textContent = "⇄";
    shuffleBtn.classList.remove("fa-shuffle");
  } else {
    shuffle = true;
    shuffleBtn.textContent = "";
    shuffleBtn.classList.add("fa-shuffle");
  }
});

// !===================playlist page ========================
// changing theme========================================
toggleThemeBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleThemeBtn.classList.toggle("toggleActive");
  toggleThemeBtn.classList.toggle("fa-brush");
  toggleThemeBtn.classList.toggle("fa-xmark");
  themePalette.classList.toggle("toggleVisibility");
});

themePalette.addEventListener("click", (event) => {
  PlaylistPage.style.background = event.target.previousElementSibling.style.background;
  sidebar.style.background = event.target.previousElementSibling.style.background;
});

//playing from default playlist=============================
playlistBody.addEventListener("click", (event) => {
  favoritePlaylistPlaying = false;
  defaultPlaylistPlaying = true;
  currentPlaylist = [...filePathsArr];
  let indexNumber = Number(event.target.getAttribute("index"));
  audioSource.src = currentPlaylist[indexNumber];
  positionInPlaylist = indexNumber + 1; //!track
  trackLoadAndPlay();
  checkIfFavorite();
  PlaylistPage.style.transform = "translateX(100%)"; //!mark
});

//switching between playlists ============================
favPlaylistBtn.addEventListener("click", () => {
  trackCount.textContent = favoritePlaylist.length;
  favPlaylistBtn.style.opacity = 1;
  defPlaylistBtn.style.opacity = 0.3;
  favouritePlaylistBody.style.transform = "translateX(0%)";
  Array.from(playlistBody.children).forEach((elem) => (elem.style.opacity = 0));
  Array.from(playlistBody.children)[0].style.opacity = 1;
});
defPlaylistBtn.addEventListener("click", () => {
  trackCount.textContent = filePathsArr.length;
  favPlaylistBtn.style.opacity = 0.3;
  defPlaylistBtn.style.opacity = 1;
  favouritePlaylistBody.style.transform = "translateX(100%)";
  Array.from(playlistBody.children)[0].style.opacity = 0;
  setTimeout(() => {
    Array.from(playlistBody.children).forEach((elem) => (elem.style.opacity = 1));
  }, 500);
});

//playing from favourite playlist ========================
favouritePlaylistBody.addEventListener("click", (event) => {
  event.stopPropagation();
  favoritePlaylistPlaying = true;
  defaultPlaylistPlaying = false;
  currentPlaylist = [...favoritePlaylist];
  let indexNumber = Array.from(favouritePlaylistBody.children).indexOf(event.target);
  audioSource.src = currentPlaylist[indexNumber];
  positionInPlaylist = indexNumber + 1; //!track
  trackLoadAndPlay();
  checkIfFavorite();
  PlaylistPage.style.transform = "translateX(100%)"; //!mark
});

// !=================Sidebar=================================
// Switch to library/playlist and toggle themes===
sidebarMisc.addEventListener("click", (event) => {
  // event.stopPropagation();
  skinCollection.style.transform = 'translateY(110%)'
  if (event.target.classList.contains("library")) {
    sidebar.style.transform = "translateX(-100%)";
    PlaylistPage.style.transform = "translateX(0%)";
    skinCollection.style.transform = 'translateY(110%)'
  }
  if (event.target.classList.contains("themes")) {
    skinCollection.style.transform = 'translateY(0%)'
  }
})

//changing player skin==============================
skinCollection.addEventListener('click', (event) => {
  PlaylistPage.style.background = event.target.style.background;
  sidebar.style.background = event.target.style.background;
  aboutDevPopUp.style.background = event.target.style.background;
  skinCollection.style.transform = 'translateY(110%)'
})
