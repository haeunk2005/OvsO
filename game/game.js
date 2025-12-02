document.addEventListener('DOMContentLoaded', () => {
    // 오디오
    const bgm = document.getElementById('bgm');
    const clickSound = document.getElementById('clickSound');
     
    // 오브젝트 & 툴팁
    const objects = document.querySelectorAll('.object');
    const tooltip = document.getElementById('tooltip');
     
    // 게이지
    const onlineBar = document.getElementById('online-bar');
    const offlineBar = document.getElementById('offline-bar');
     
    // 엔딩
    const endingContainer = document.getElementById('ending-container');
    const endingImage = document.getElementById('ending-image');
     
    // 클릭 횟수 & 카운트
    let totalClicks = 0;
    const counts = { game:0, phone:0, book:0, door:0 };
     
    // 게이지 %
    let onlinePercent = 0;
    let offlinePercent = 0;
     
    // ✨ 엔딩 5 이미지 관련 변수 (기존)
    let isEnding5 = false; // 현재 엔딩 5 진행 중인지
    let ending5Step = 0;   // 엔딩 5 현재 단계 (1부터 5까지)
    const MAX_ENDING_STEP = 5; // 엔딩 2, 5 모두 사용
    // -------------------------------
    
    // 1. 볼륨 설정 적용 (setting.html 반영)
    const savedBgm = localStorage.getItem("bgmVolume");
    const savedSfx = localStorage.getItem("sfxVolume");
     
    bgm.volume = savedBgm !== null ? savedBgm / 100 : 0.4;
    clickSound.volume = savedSfx !== null ? savedSfx / 100 : 0.7;
     
    // 다른 탭/창에서 localStorage 변경 시 실시간 반영
    window.addEventListener('storage', (event) => {
        if(event.key === 'bgmVolume') bgm.volume = event.newValue / 100;
        if(event.key === 'sfxVolume') clickSound.volume = event.newValue / 100;
    });
     
    // -------------------------------
    // 2. BGM 자동 재생 (화면 어디 클릭해도)
    let bgmStarted = false;
    function startBGM() {
        if(!bgmStarted) {
            bgm.play().catch(() => console.log("자동재생 차단됨"));
            bgmStarted = true;
        }
    }
    document.body.addEventListener('click', startBGM, { once:true });
     
    // -------------------------------
    // 3. 클릭 시 효과음 재생
    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play();
    }
     
    // -------------------------------
    // 4. 게이지 업데이트
    function updateGauges() {
        onlineBar.style.height = onlinePercent + '%';
        offlineBar.style.height = offlinePercent + '%';
    }
     
    // -------------------------------
    // 5. 툴팁 표시
    function showTooltip(e, text) {
        tooltip.style.display = 'block';
        tooltip.innerText = text;
        tooltip.style.left = e.pageX + 15 + 'px';
        tooltip.style.top = e.pageY + 15 + 'px';
    }
    function hideTooltip() {
        tooltip.style.display = 'none';
    }
     
    // -------------------------------
    // 6. 엔딩 체크
    function checkEnding() {
        if(totalClicks >= 10) {
            let endingSrc = '';
            
            // ✨ 엔딩 2 다단계 이미지 진행을 위한 변수 추가 및 초기화
            let isEnding2 = false;
            let ending2Step = 0;
     
            if(onlinePercent > offlinePercent){
                // BGM 정지
                bgm.pause(); 
                isEnding5 = false;
                
                // ----------------------------------------
                // ✨ 엔딩 2 조건 (온라인 > 오프라인 && phone >= game)
                if (counts.phone >= counts.game) { 
                    isEnding2 = true; // 엔딩 2 진행 시작
                    ending2Step = 1;
                    endingSrc = `../images/ending2/ending2_${ending2Step}.png`; // 엔딩 2 첫 이미지
                } else {
                    // 엔딩 1 조건 (온라인 > 오프라인 && game > phone)
                    endingSrc = '../images/ending/ending1.png';
                }
                // ----------------------------------------

            } else if(offlinePercent > onlinePercent){
                // BGM 정지
                bgm.pause(); 
                isEnding5 = false;
                isEnding2 = false; // 엔딩 2가 아니므로 초기화
                endingSrc = counts.book > counts.door ? '../images/ending/ending3.png'
                          : counts.door >= counts.book ? '../images/ending/ending4.png' : '';
            } else {
                // ✨ 엔딩 5 (온라인 == 오프라인)
                // BGM 유지 (bgm.pause() 생략)
                isEnding5 = true;
                isEnding2 = false; // 엔딩 2가 아니므로 초기화
                ending5Step = 1; // 첫 번째 이미지
                endingSrc = `../images/ending5/ending5_${ending5Step}.png`;
            }
  
            // 모든 오브젝트 클릭 비활성화 (엔딩 진행 중 클릭 방지)
            objects.forEach(obj => obj.style.pointerEvents = 'none');
            
            endingContainer.style.display = 'flex';
            endingImage.src = endingSrc;
            
            // ✨ 다단계 엔딩 이미지 클릭 이벤트 재설정 (엔딩 2와 5 모두 처리)
            endingImage.onclick = () => {
                if (isEnding2) { // 엔딩 2 진행 중
                    ending2Step++;
                    if (ending2Step <= MAX_ENDING_STEP) {
                        endingImage.src = `../images/ending2/ending2_${ending2Step}.png`;
                    } else {
                        window.location.href = '../index.html'; // 마지막 이미지 클릭 시 메인으로
                    }
                } else if (isEnding5) { // 엔딩 5 진행 중
                    ending5Step++;
                    if (ending5Step <= MAX_ENDING_STEP) {
                        endingImage.src = `../images/ending5/ending5_${ending5Step}.png`;
                    } else {
                        window.location.href = '../index.html'; // 마지막 이미지 클릭 시 메인으로
                    }
                } else {
                    // 엔딩 1, 3, 4: 이미지 클릭 시 index.html로 이동
                    window.location.href = '../index.html';
                }
            };
        }
    }
     
    // -------------------------------
    // 7. 오브젝트 클릭 / hover 처리
    objects.forEach(obj => {
        // hover 시 tooltip 표시
        obj.addEventListener('mouseenter', e => showTooltip(e, obj.dataset.action));
        obj.addEventListener('mousemove', e => showTooltip(e, obj.dataset.action));
        obj.addEventListener('mouseleave', hideTooltip);
     
        // 클릭 시 게이지 상승 & 효과음
        obj.addEventListener('click', () => {
            if(totalClicks >= 10) return; // 엔딩 발생 후 추가 클릭 방지 (안전 장치)
            
            playClickSound();
            startBGM(); // 혹시 아직 시작 안 됐으면 실행
            totalClicks++;
     
            switch(obj.id){
                case 'game-console': counts.game++; onlinePercent +=10; break;
                case 'phone': counts.phone++; onlinePercent +=10; break;
                case 'book': counts.book++; offlinePercent +=10; break;
                case 'door': counts.door++; offlinePercent +=10; break;
            }
     
            onlinePercent = Math.min(onlinePercent, 100);
            offlinePercent = Math.min(offlinePercent, 100);
     
            updateGauges();
            checkEnding();
        });
    });
     
    // -------------------------------
    // 8. 엔딩 이미지 클릭 시 닫기/다음 이미지 (6번에서 처리하므로 삭제)
    // 기존 코드는 삭제됨
});