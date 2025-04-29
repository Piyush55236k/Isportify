let currfolder;
let circle = document.querySelector(".circle");
let currentSong = new Audio();
let songs;
let cards = document.querySelector(".container");
let songsList = [];

// const imgCover = document.querySelector(".rightSide").getElementsByTagName("img")[0];

// Function to format time from seconds to mm:ss
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Function to fade out the current song and play the new song
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

// Function to fade in the new song
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

async function getSongs(folder) {
    currfolder = folder;
    try {
        // Fetch song list from the relative path
        let response = await fetch(`Assets/${currfolder}`);
        let htmlText = await response.text();
        let div = document.createElement("div");
        div.innerHTML = htmlText;

        let as = div.getElementsByTagName("a");

        songsList = [];
        for (let i = 0; i < as.length; i++) {
            let element = as[i];
            if (element.href.endsWith(".mp3")) {
                // Correct: extract filename after /folder/
                let songName = decodeURIComponent(element.href.split(`${folder}`)[1]);
                songsList.push(songName);
            }
        }

        songsList.sort((a, b) => a.localeCompare(b));

        // Populate the library list
        let cardList = document.querySelector("#libraryCards ul");
        cardList.innerHTML = "";
        for (const song of songsList) {
            cardList.innerHTML += `
                <li>
                    <img src="Assets/favicons/music-1005-svgrepo-com.svg" width="20px" height="20px">
                    <div class="info">
                        <p>${song}</p>
                        <img src="Assets/favicons/play-circle-svgrepo-com.svg" width="30px" height="30px">
                    </div>
                </li>`;
        }

        // Add click event listeners to play songs
        Array.from(cardList.getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                playMusic(e.querySelector(".info p").innerHTML.trim());
            });
        });

        return songsList;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `Assets/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "Assets/favicons/pause-1006-svgrepo-com.svg";
    }
    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songTime").innerHTML = `00:00/${formatTime(currentSong.duration || 0)}`;
};

async function displayAlbums() {
    let albums = await fetch("Assets/Songs/");
    let response = await albums.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // console.log(e.href);
        if (e.href.includes("/Songs/")) {
             console.log(e.href.split("/").slice(-2)[1]);
            let folder = e.href.split("/").slice(-2)[1];
            //meta data for folder
            let albums = await fetch(`Assets/Songs/${folder}/info.json`);
            let response = await albums.json();
            cards.innerHTML = cards.innerHTML + ` <div class="card" data-folder="${folder}">
                    <div class="playlistCard">
                        <img src="Assets/Songs/${folder}/cover.PNG" alt="image">
                        <div class="playlistInfo">
                            <h3>${response.title}</h3>
                            <p>${response.description}</p>
                        </div>
                    </div>

                </div>
`
        }
    }

     // Load the library card songs
     Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (e) => {
            songs = await getSongs(`Songs/${e.currentTarget.dataset.folder}/`);
            playMusic(songs[0]);
        });
    });
}

async function getSongNames() {
    await getSongs(`Songs/Hindi/`);
    playMusic(songsList[0], true);

    //show albums
    displayAlbums();

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration || 0)}`;
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
            play.src = "Assets/favicons/pause-1006-svgrepo-com.svg";
        } else {
            currentSong.pause();
            play.src = "Assets/favicons/play-1003-svgrepo-com.svg";
        }
    });

    document.querySelector(".seekbaar").addEventListener("click", (e) => {
        let percent2 = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = (percent2 + "%");
        currentSong.currentTime = (currentSong.duration * percent2) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".leftSide").style.right = "1%";
        document.querySelector(".leftSide").style.display = "block";
    });

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".leftSide").style.right = "-120%";
        document.querySelector(".leftSide").style.display = "none";
    });

    next.addEventListener("click", () => {
        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let currentIndex = songsList.indexOf(currentFile);
        if (currentIndex !== -1) {
            let nextIndex = (currentIndex + 1) % songsList.length;
            fadeOutAndPlayNewSong(songsList[nextIndex]);
        }
    });

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
        window.location.href = "index.html";
    });

    document.querySelector(".home").addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

getSongNames();
