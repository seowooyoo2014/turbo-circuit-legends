# Turbo Circuit Legends

Three.js로 만든 독자적인 HTML5 3D 카트 레이싱 게임입니다. 모델, 트랙, 아이템, 사운드는 모두 코드에서 직접 생성하며 특정 회사의 에셋을 복사하지 않습니다.
Three.js 모듈은 `assets/vendor/three.module.js`에 포함되어 있어 외부 CDN 없이 로컬 서버에서 실행됩니다.

## 실행

브라우저 보안 정책 때문에 ES6 모듈은 로컬 서버에서 실행하는 것을 권장합니다.

```bash
python3 -m http.server 5173
```

그 다음 `http://localhost:5173/index.html`을 엽니다.

처음에는 메인 허브가 열립니다. 여기에서 `스토리 모드`, `오픈월드 모드`, `레이싱 모드`를 선택할 수 있습니다. 오픈월드 모드는 `racing-world.html`로 이동하며, 각 모드의 `메인화면` 버튼으로 허브에 돌아올 수 있습니다.

## 조작

- `↑` / `W`: 가속
- `↓` / `S`: 브레이크/후진
- `←`, `→` / `A`, `D`: 조향
- `Shift`: 드리프트
- `Space`: 아이템 사용
- `Esc`: 일시정지
- `R`: 리스폰

## 포함 기능

- 카드형 메인 허브: 스토리 모드, 오픈월드 모드, 레이싱 모드 선택
- 스토리 모드 `브레이크라인: 루키 시즌`: 가상 팀 아스터 레이싱 아카데미와 팀메이트 갈등을 다루는 5챕터, 챕터당 2파트, 파트당 연습/예선/결승 풀 위켄드 드라마
- 실시간 3D 컷신과 프리렌더 영상 컷신 fallback 구조: `assets/cinematics/`에 세션별 WebM을 넣으면 먼저 재생하고, 파일이 없으면 차고/피트월/그리드 실시간 3D 컷신으로 진행
- 스토리 전용 아이템 없는 F1풍 경기 규칙: 연습 랩타임, 예선 결과 기반 결승 그리드, 섹터/랩 델타, 타이어 마모, 피트스톱, DRS풍 추월 보조, 트랙 리밋 페널티
- 스토리 전용 가상 GP 서킷 5종: Aster Arena GP, Harbor Night GP, Highland Switchback GP, Rainline Technical GP, Aurora Final GP
- 상용풍 1차 그래픽 프리셋: sRGB 색공간, ACES 톤매핑, 부드러운 그림자, 아레나 전용 림라이트/그리드 조명, PBR 느낌의 유리/금속/고무/페인트 재질
- GLB/PBR 에셋 교체 슬롯: `assets/models/`와 `assets/textures/`에 팀별 포뮬러형 레이싱카/드라이버/컷신 세트 모델과 텍스처를 넣으면 절차적 모델을 고급 에셋으로 바꿀 수 있는 구조
- 오픈월드 모드 연결: `racing-world.html` 자유 주행 월드와 메인화면 복귀
- 3인칭 추적 카메라, 드리프트 회전, 점프/충돌 흔들림, 부스터 FOV 증가
- 안정화된 자체 차량 물리: 접지/서스펜션 보정, 평지 y축 떨림 감쇠, 아레나 저굴곡 노면, 슬립 기반 드리프트 감각
- 파랑/주황/보라 3단계 미니터보와 부스터 불꽃/스파크, 뒷바퀴 드리프트 연기, 타이어 자국 효과
- 아이템 박스, 3초 룰렛, 15종 아이템, AI 아이템 사용
- 아이템전, 그랑프리, 서바이벌전, 스피드전
- 월드 투어 코스와 사막, 초원, 화산, 눈, 도시, 우주, 프리즘 판타지, 스토리 가상 GP 코스
- 높이 지형을 따라가는 리본형 도로, 구역별 장식, 구역 색상 미니맵
- 시작/골 지점 체크 라인과 골대, 장애물 충돌 시 정지/카메라 흔들림/쿵 효과음
- 조립식 캐릭터/카트 프리셋: 키, 덩치, 옷, 머리, 헬멧, 액세서리, 바퀴 크기, 글라이더 차이
- 특정 회사 캐릭터나 에셋을 복제하지 않는 독자 아키타입 캐릭터 프리셋
- 미니맵, 속도계, 랩, 순위, 아이템 슬롯, 부스터 게이지, FPS, 일시정지, 결과 화면
- Web Audio 엔진음/효과음, LocalStorage 기록/설정 저장
- 단순 LOD 성격의 프로시저 장식, 재사용 지오메트리, 투사체/이펙트 관리

## 폴더

- `index.html`: 게임 진입점
- `style.css`: 메뉴와 HUD
- `game.js`: Three.js 렌더러, 모드, 루프, 카메라
- `physics.js`: 차량 물리
- `player.js`: 카트/레이서
- `ai.js`: AI 주행과 아이템 사용
- `items.js`: 아이템, 투사체, 충돌, 이펙트
- `effects.js`: 드리프트 연기, 타이어 자국, 아레나 관중/조명 효과
- `ui.js`: 메뉴, HUD, 영화식 컷신, 결과, 저장
- `audio.js`: Web Audio 합성 사운드
- `track.js`: 코스 데이터와 프로시저 트랙 생성
- `assets.js`: GLB 모델 슬롯과 절차적 fallback 관리
- `shaders/`: 확장용 커스텀 셰이더
- `assets/`: 무료 에셋 추가 위치
- `assets/vendor/GLTFLoader.js`: Three.js r165용 GLB/glTF 로더
- `assets/cinematics/`: 스토리 컷신용 WebM/MP4 영상 위치
- `tools/`: Blender 장면 생성 같은 제작 보조 스크립트

## 확장 방법

새 코스는 `track.js`의 `TRACKS`에 테마를 추가하고, 경로 제어점이나 장식 규칙을 확장하면 됩니다. 새 아이템은 `items.js`의 `ITEM_DEFS`와 `useItem` 액션에 추가합니다.

고급 3D 에셋을 추가하려면 `assets/models/README.md`의 슬롯 이름을 따라 GLB를 넣고, 필요한 PBR 텍스처는 `assets/textures/`에 둡니다. 스토리 차량은 팀별 `formula_*.glb`를 우선 사용하며, 파일이 없으면 직접 생성한 포뮬러풍 절차적 차량과 팀 리버리로 정상 실행됩니다.

고화질 스토리 컷신은 Blender로 모델링/렌더링한 WebM 또는 Unreal Sequencer로 제작한 영상을 `assets/cinematics/`에 넣으면 됩니다. 첫 차고 인트로는 `tools/create_ch01a_practice_intro.py`와 `assets/cinematics/source/CH01A_PRACTICE_INTRO_GUIDE.md`에서, 첫 대형 사고 장면은 `tools/create_ch02a_race_incident.py`와 `assets/cinematics/source/CH02A_RACE_INCIDENT_GUIDE.md`에서 바로 시작할 수 있습니다. 권장 파일명과 제작 기준은 `assets/cinematics/README.md`를 참고하세요.
