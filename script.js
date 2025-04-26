const songURL = "/Assets/Songs/"; // Use a relative path here
let circle = document.querySelector(".circle");
let currentSong = new Audio();
let songs;
const imgCover = document.querySelector(".rightSide").getElementsByTagName("img")[0];

//function to change time format from seconds to mm:ss
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

//function to fade out the current song and play the new song
function fadeOutAndPlayNewSong(newTrack) {
    let fadeOut = setInterval(() => {
        if (currentSong.volume > 0.05) {
            currentSong.volume -= 0.05;
        } else {
            clearInterval(fadeOut);
            currentSong.pause();
            currentSong.volume = 0;
            playMusic(newTrack);
            fadeIn();
        }
    }, 50);
}

function fadeIn() {
    let fadeIn = setInterval(() => {
        if (currentSong.volume < 0.95) {
            currentSong.volume += 0.05;
        } else {
            clearInterval(fadeIn);
            currentSong.volume = 1;
        }
    }, 50);
}

async function getSongs() {
    // Fetch song list from the relative path
    let a = await fetch(songURL);
    let response = await a.text();
    let div = document.createElement("div");
    div.className = "songs";
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songsList = [];
    for (let i = 0; i < as.length; i++) {
        let element = as[i];
        if (element.href.endsWith(".mp3")) {
            let songName = decodeURIComponent(element.href.split("/Songs/")[1]);
            songsList.push(songName);
        }
    }
   
    songsList.sort((a, b) => a.localeCompare(b));
    return songsList;
}

const playMusic = (track, pause = false) => {
    // Update the path to be relative
    currentSong.src = "/Assets/Songs/" + track;
    if (!pause) {
        currentSong.play();
        play.src = "/Assets/favicons/pause-1006-svgrepo-com.svg";
    }
    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songTime").innerHTML = "00:00/00:00";
    imgCover.src = `https://picsum.photos/seed/${Math.random()}/400/400`;
};

async function getSongNames() {
    songs = await getSongs();
    playMusic(songsList[0], true);
    let cardList = document.querySelector("#libraryCards").getElementsByTagName("ul")[0];

    for (const song of songsList) {
        cardList.innerHTML = cardList.innerHTML + ` <li>
                        <img src="/Assets/favicons/music-1005-svgrepo-com.svg" alt="" srcset="" width="20px" height="20px">
                        <div class="info">
                        <div>${song}</div>
                        
                            <img src="/Assets/favicons/play-circle-svgrepo-com.svg" alt="" srcset="" width="30px" height="30px">
                        </div>
                    </li> `;
    }

    Array.from(document.querySelector("#libraryCards").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        let percent = (currentSong.currentTime / currentSong.duration) * 100;
        circle.style.left = percent + "%";
    });

    currentSong.addEventListener("ended", () => {
        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let currentIndex = songsList.indexOf(currentFile);
        if (currentIndex !== -1) {
            let nextIndex = (currentIndex + 1) % songsList.length;
            fadeOutAndPlayNewSong(songsList[nextIndex]);
        }
    });

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/Assets/favicons/pause-1006-svgrepo-com.svg";
        } else {
            currentSong.pause();
            play.src = "/Assets/favicons/play-1003-svgrepo-com.svg";
        }
    });

    // Add event listener to the seekbar
    document.querySelector(".seekbaar").addEventListener("click", (e) => {
        let percent2 = e.offsetX / e.target.getBoundingClientRect().width * 100;
        document.querySelector(".circle").style.left = (percent2 + "%");
        currentSong.currentTime = ((currentSong.duration) * percent2 / 100);
    });

    // Add event listener to the left side menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".leftSide").style.right = 1 + "%";
        document.querySelector(".leftSide").style.display = "block";
    });

    // Add event listener to the cross button
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".leftSide").style.right = -120 + "%";
        document.querySelector(".leftSide").style.display = "none";
    });

    // Handle Next button with fade
    next.addEventListener("click", () => {
        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let currentIndex = songsList.indexOf(currentFile);
        if (currentIndex !== -1) {
            let nextIndex = (currentIndex + 1) % songsList.length;
            fadeOutAndPlayNewSong(songsList[nextIndex]);
        }
    });

    // Handle Previous button with fade
    previous.addEventListener("click", () => {
        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let currentIndex = songsList.indexOf(currentFile);
        if (currentIndex > 0) {
            fadeOutAndPlayNewSong(songsList[currentIndex - 1]);
        } else {
            fadeOutAndPlayNewSong(songsList[0]);
        }
    });

    document.querySelector(".logo").addEventListener("click", () => {
        window.location.href = "index.html"; // navigate to a new page
    });

    document.querySelector(".home").addEventListener("click", () => {
        window.location.href = "index.html"; // navigate to a new page
    });
}

getSongNames();
