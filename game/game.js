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
  
  // 엔딩 5 이미지 관련 변수 
  let isEnding5 = false; // 현재 엔딩 5 진행 중인지
  let ending5Step = 0;   // 엔딩 5 현재 단계 (1부터 5까지)
  const MAX_ENDING_STEP = 5; // 엔딩 1, 5 모두 사용
  
  // 엔딩 1 다단계 이미지 진행을 위한 변수
  let isEnding1 = false;
  let ending1Step = 0;

  // ----------------------------------------
  // 엔딩 3 다단계 이미지 진행을 위한 변수 추가
  let isEnding3 = false; // 현재 엔딩 3 진행 중인지
  let ending3Step = 0;   // 엔딩 3 현재 단계 (1부터 10까지)
  const MAX_ENDING3_STEP = 10; // 엔딩 3는 이미지가 10개이므로 별도 정의
  // ----------------------------------------
  
  // ----------------------------------------
  // 엔딩 4 다단계 이미지 진행을 위한 변수 추가
  let isEnding4 = false; // 현재 엔딩 4 진행 중인지
  let ending4Step = 0;   // 엔딩 4 현재 단계 (1부터 8까지)
  const MAX_ENDING4_STEP = 8; // 엔딩 2, 4 모두 사용

  // 엔딩 2 다단계 이미지 진행을 위한 변수
  let isEnding2 = false;
  let ending2Step = 0;

  // ----------------------------------------
  
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
          
          // 다단계 엔딩 플래그 초기화
          isEnding1 = false;
          isEnding2 = false;
          isEnding3 = false;
          isEnding4 = false; 
          isEnding5 = false;
          
          if(onlinePercent > offlinePercent){
              // BGM 정지
              bgm.pause(); 
              
              // 엔딩 2 조건 (온라인 > 오프라인 && game >= phone)
              if (counts.game >= counts.phone) { 
                  isEnding2 = true; // 엔딩 2 진행 시작
                  ending2Step = 1;
                  endingSrc = `../images/ending2/ending2_${ending2Step}.png`; // 엔딩 2 첫 이미지
              } else {
                  // 엔딩 1 조건 (온라인 > 오프라인 && phone > game)
                  isEnding1 = true; // 엔딩 2 진행 시작
                  ending1Step = 1;
                  endingSrc = `../images/ending1/ending1_${ending1Step}.png`;
              }
              
          } else if(offlinePercent > onlinePercent){
              // BGM 정지
              bgm.pause(); 
              
              // 오프라인 엔딩 조건 분기 수정
              if (counts.book > counts.door) {
                  // 엔딩 3 조건 (오프라인 > 온라인 && book > door)
                  isEnding3 = true; // 엔딩 3 진행 시작
                  ending3Step = 1;
                  endingSrc = `../images/ending3/ending3_${ending3Step}.png`;
              } else if (counts.door >= counts.book) {
                  // 엔딩 4 조건 (오프라인 > 온라인 && door >= book)
                  isEnding4 = true; // 엔딩 4 진행 시작
                  ending4Step = 1;
                  endingSrc = `../images/ending4/ending4_${ending4Step}.png`; // 엔딩 4 첫 이미지
              }
              
          } else {
              // 엔딩 5 (온라인 == 오프라인)
              // BGM 유지 (bgm.pause() 생략)
              isEnding5 = true;
              ending5Step = 1; // 첫 번째 이미지
              endingSrc = `../images/ending5/ending5_${ending5Step}.png`;
          }

          // 모든 오브젝트 클릭 비활성화 (엔딩 진행 중 클릭 방지)
          objects.forEach(obj => obj.style.pointerEvents = 'none');
          
          endingContainer.style.display = 'flex';
          endingImage.src = endingSrc;
          
          // 다단계 엔딩 이미지 클릭 이벤트 재설정
          endingImage.onclick = () => {
              if (isEnding2) { // 엔딩 2 진행 중
                  ending2Step++;
                  if (ending2Step <= MAX_ENDING4_STEP) {
                      endingImage.src = `../images/ending2/ending2_${ending2Step}.png`;
                  } else {
                      window.location.href = '../index.html'; // 마지막 이미지 클릭 시 메인으로
                  }
              } else if (isEnding1) { //  엔딩 1 진행 중
                  ending1Step++;
                  if (ending1Step <= MAX_ENDING_STEP) {
                      endingImage.src = `../images/ending1/ending1_${ending1Step}.png`;
                  } else {
                      window.location.href = '../index.html'; // 마지막 이미지 클릭 시 메인으로
                  }
              } else if (isEnding3) { //  엔딩 3 진행 중
                  ending3Step++;
                  if (ending3Step <= MAX_ENDING3_STEP) {
                      endingImage.src = `../images/ending3/ending3_${ending3Step}.png`;
                  } else {
                      window.location.href = '../index.html'; // 마지막 이미지 클릭 시 메인으로
                  }
              } else if (isEnding4) { //  엔딩 4 진행 중
                  ending4Step++;
                  if (ending4Step <= MAX_ENDING4_STEP) {
                      endingImage.src = `../images/ending4/ending4_${ending4Step}.png`;
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
                  // 엔딩 1, 3: 이미지 클릭 시 index.html로 이동
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
});