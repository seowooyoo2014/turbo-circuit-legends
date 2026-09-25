# 3D Model Slots

이 폴더는 스토리 컷신과 아레나를 GLB 모델로 교체하기 위한 자리입니다. 현재 게임은 파일이 없어도 Three.js 절차적 모델로 실행됩니다.
`assets/vendor/GLTFLoader.js`가 포함되어 있으므로 아래 파일을 넣고 페이지를 새로고침하면 해당 슬롯이 우선 로드됩니다.

지원 슬롯:

- `arena_garage.glb`: 차고 내부 세트
- `arena_grid.glb`: 스타팅 그리드 세트
- `pit_wall.glb`: 피트월/전략 모니터 세트
- `hero_kart.glb`: 플레이어 대표 차량
- `hero_formula.glb`: 스토리 모드 플레이어 포뮬러형 레이싱카
- `cpu_formula_a.glb`: 스토리 모드 라이벌/CPU 포뮬러형 레이싱카 A
- `cpu_formula_b.glb`: 스토리 모드 라이벌/CPU 포뮬러형 레이싱카 B
- `formula_aster_works.glb`: 아스터 워크스 팀 차량
- `formula_vela_storm.glb`: 벨라 스톰 팀 차량
- `formula_crimson_apex.glb`: 크림슨 에이펙스 팀 차량
- `formula_neon_harbor.glb`: 네온 하버 팀 차량
- `formula_aurora_vector.glb`: 오로라 벡터 팀 차량
- `driver_rookie.glb`: 루키 드라이버

권장 규칙:

- 원점 기준 단위는 미터처럼 사용합니다.
- 차량 GLB의 앞방향은 `+Z`, 원점은 바닥 중앙, 스케일 1 기준으로 기존 차량 크기와 맞춥니다.
- 차량 구성은 낮은 노즈, 오픈휠, 프론트윙, 리어윙, 사이드포드, 콕핏, 헤일로풍 보호 구조를 권장합니다.
- 팀별 차량은 색, 노즈, 프론트윙, 리어윙, 사이드포드, 번호판, 추상 스폰서 패턴이 다르게 보이게 제작합니다.
- 파츠 이름은 `body`, `front_wing`, `rear_wing`, `sidepod_l`, `sidepod_r`, `wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr`, `halo`, `cockpit`처럼 읽기 쉽게 둡니다.
- 모델은 실제 F1 팀, 선수, 로고, 서킷, 상용 게임 에셋을 복제하지 않는 독자 디자인이어야 합니다.
- 브라우저 성능을 위해 차량은 15k~35k triangles, 컷신 세트는 30k 이하를 권장합니다.
- 텍스처는 `assets/textures/`에 두고 glTF PBR metallic-roughness 기준으로 연결합니다.
- 그림자가 필요한 큰 파츠만 `castShadow`를 켜는 구성을 권장합니다.
