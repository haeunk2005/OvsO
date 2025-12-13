document.addEventListener('DOMContentLoaded', () => {
    // 버튼 요소 가져오기
    const startGameBtn = document.getElementById('startGameBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    // 오디오 요소
    const bgm = document.getElementById('bgm');
    const clickSound = document.getElementById('clickSound');

    // 저장된 볼륨 불러오기
    const savedBgm = localStorage.getItem("bgmVolume");
    const savedSfx = localStorage.getItem("sfxVolume");

    bgm.volume = savedBgm !== null ? savedBgm / 100 : 0.4;
    bgm.loop = true; // 반복 재생

    clickSound.volume = savedSfx !== null ? savedSfx / 100 : 0.7;

    let bgmStarted = false;

    // BGM 재생 함수
    function startBGM() {
        if (!bgmStarted) {
            bgm.play().catch(() => console.log("자동재생 차단됨"));
            bgmStarted = true;
        }
    }

    // 효과음 재생 함수
    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play();
    }

    // ✅ 화면 아무 곳이나 클릭 시 BGM 재생 시작
    document.addEventListener('click', () => {
        startBGM();
    }, { once: true });

    // 버튼 클릭 시 효과음 + BGM
    document.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            playClickSound();
            startBGM();
        });
    });

    // 게임 시작 버튼 클릭
    startGameBtn.addEventListener('click', () => {
        playClickSound();   // 버튼 클릭 효과음
    startBGM();         // BGM 재생
    window.location.href = "./game/game.html"; // 게임 화면으로 이동
    });

    // 설정 버튼 클릭
    settingsBtn.addEventListener('click', () => {
        playClickSound();   // 버튼 클릭 효과음
    startBGM();         // BGM 재생
        window.location.href = "./setting/setting.html";
    });

    // ✅ 실시간 볼륨 반영 (다른 탭/창에서 localStorage 변경 감지)
    window.addEventListener('storage', (event) => {
        if (event.key === 'bgmVolume') {
            bgm.volume = event.newValue / 100;
        } else if (event.key === 'sfxVolume') {
            clickSound.volume = event.newValue / 100;
        }
    });
});
