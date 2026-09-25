export const STORY_SAVE_KEY = "turbo-circuit-story";

const arenaName = "아스터 그랑프리 아레나";
const STORY_TRACK_BY_CHAPTER = {
  1: "arena",
  2: "harbor_gp",
  3: "rainline_gp",
  4: "highland_gp",
  5: "aurora_gp"
};
const STORY_WEATHER_BY_CHAPTER = {
  1: "clear",
  2: "night",
  3: "wet",
  4: "cloudy",
  5: "finale"
};

function frame(scene, title, speaker, text, camera = scene, motion = "hold") {
  return { scene, set: scene, camera, actors: ["player", "rival"], duration: 4.2, motion, title, speaker, text };
}

export const STORY_CHAPTERS = [
  {
    id: 1,
    title: "첫 시트",
    tag: "계약 테스트",
    trackId: "arena",
    arenaPreset: "garage-test",
    laps: 1,
    difficulty: "Normal",
    targetLapTime: 78,
    sectorTargets: [25.8, 26.4, 25.8],
    brakeHint: "1코너 110m 표지에서 짧게 강하게 브레이크",
    goal: { type: "rankAtMost", rank: 3, label: "아레나 테스트에서 3위 이상" },
    reward: "아스터 레이싱 아카데미 루키 시트",
    briefing: [
      "아스터 그랑프리 아레나의 새벽 테스트. 관중석은 비어 있지만 피트월의 모니터는 모두 당신을 향합니다.",
      "3위 안에 들면 아스터 레이싱 아카데미의 루키 시트가 열립니다."
    ],
    introCutscene: [
      frame("garage", "차고 내부", "서윤", "셔터가 올라가면 조명, 카메라, 피트월이 전부 당신을 봅니다. 오늘은 테스트지만, 실패하면 계약서는 닫혀요.", "garage", "push"),
      frame("pit", "피트월 모니터", "민 대표", "섹터 기록은 이미 봤습니다. 내가 필요한 건 가능성이 아니라, 압박 속에서도 반복되는 랩타임입니다.", "pit", "pan"),
      frame("grid", "스타팅 그리드", "도윤", "그리드 정렬 완료. 첫 코너에서 차를 살리고, 마지막 직선에서 모두에게 이유를 보여주세요.", "grid", "low"),
      frame("teamRadio", "헬멧 바이저", "서윤", "숨 한 번. 손은 가볍게. 여기까지 온 이유를 운전대가 대신 말하게 해요.", "teamRadio", "handheld")
    ],
    midRaceDrama: [
      { at: 2.5, speaker: "도윤", text: "스타트 좋습니다. 앞차의 슬립스트림 안으로 천천히 들어가요." },
      { at: 18, speaker: "서윤", text: "헤어핀 출구에서 부스트를 아껴요. 짧게, 정확하게." },
      { at: 36, speaker: "민 대표", text: "3위 안쪽이면 계약서가 움직입니다. 흔들리지 마세요." }
    ],
    successText: "서윤이 무전 너머로 숨을 내쉽니다. 아스터의 루키 시트가 당신 이름으로 채워졌습니다.",
    failText: "속도는 보였지만 결과표가 부족했습니다. 민 대표는 고개를 젓고, 서윤은 다시 테스트 시간을 잡습니다.",
    successCutscene: [
      frame("podium", "빈 관중석의 박수", "서윤", "좋아요. 완벽하진 않았지만, 팀이 고칠 수 있는 실수와 팀이 살 수 없는 재능은 다릅니다."),
      frame("pressRoom", "계약서", "민 대표", "루키 시트는 줍니다. 하지만 다음부터는 테스트가 아니라 경기입니다."),
      frame("garage", "아스터 차고", "하진", "같은 차고라고 같은 대우를 받는 건 아니야. 다음 레이스에서 보자, 루키.")
    ],
    failCutscene: [
      frame("pit", "차가운 피트월", "민 대표", "결과가 전부라고 말했죠. 오늘은 결과가 부족했습니다."),
      frame("garage", "정비등 아래", "서윤", "라인은 좋았어요. 다시 달리면 잡을 수 있습니다. 포기하기엔 데이터가 너무 아깝네요.")
    ]
  },
  {
    id: 2,
    title: "같은 차고의 적",
    tag: "팀메이트 갈등",
    trackId: "arena",
    arenaPreset: "team-duel",
    laps: 2,
    difficulty: "Normal",
    targetLapTime: 76.5,
    sectorTargets: [25.2, 25.9, 25.4],
    brakeHint: "하진 뒤에서는 헤어핀 진입보다 출구 가속을 우선",
    rivalName: "하진",
    goal: { type: "beatRival", rival: "하진", label: "팀메이트 하진보다 앞서기" },
    reward: "전략 우선권",
    briefing: [
      "정식 훈련 첫날, 빠르지만 공격적인 팀메이트 하진이 당신의 바로 옆 그리드에 섭니다.",
      "팀은 협력을 말하지만 전략 우선권은 더 앞에서 끝내는 드라이버에게 갑니다."
    ],
    introCutscene: [
      frame("garage", "같은 차고", "하진", "루키가 테스트 한 번 잘했다고 내 피트보드까지 가져가진 못해."),
      frame("pit", "피트월 회의", "민 대표", "둘 중 더 앞에서 끝내는 드라이버에게 다음 경기 전략 우선권을 줍니다. 팀 안의 순서는 트랙이 정하죠."),
      frame("garage", "정비 테이블", "서윤", "하진은 진입이 빠르지만 출구가 흔들려요. 감정으로 붙지 말고, 탈출 가속으로 지나가요."),
      frame("grid", "나란히 선 두 차", "하진", "내 뒤만 따라오면 트랙은 배울 수 있을 거야.")
    ],
    midRaceDrama: [
      { at: 4, speaker: "하진", text: "너무 가까이 붙지 마. 팀 차 두 대를 동시에 잃고 싶진 않거든." },
      { at: 28, speaker: "서윤", text: "하진의 후반 타이어가 흔들립니다. 지금 압박하세요." },
      { at: 58, speaker: "도윤", text: "같은 팀이라도 라인은 하나입니다. 빈 공간이 있으면 들어가요." }
    ],
    successText: "하진의 무전이 잠깐 조용해집니다. 피트월은 이제 당신의 레이스 페이스를 인정합니다.",
    failText: "하진이 먼저 체커를 받았습니다. 서윤은 말합니다. '다음엔 진입보다 출구를 봐요.'",
    successCutscene: [
      frame("pressRoom", "공식 인터뷰 전", "하진", "오늘은 네가 빨랐어. 하지만 한 경기로 차고의 주인이 바뀌진 않아."),
      frame("pit", "전략 모니터", "민 대표", "다음 경기, 첫 전략 콜은 루키에게 갑니다. 숫자가 그렇게 말하네요."),
      frame("garage", "조용한 미소", "서윤", "팀메이트를 이겼다고 끝이 아니에요. 이제 팀이 당신을 이용하려 들 겁니다.")
    ],
    failCutscene: [
      frame("garage", "닫힌 차고문", "하진", "배우는 건 빠르네. 이기는 건 아직 멀었지만."),
      frame("pit", "데이터 리뷰", "서윤", "하진을 따라가려다 브레이크 포인트가 늦었어요. 다음엔 당신의 리듬으로 붙읍시다.")
    ]
  },
  {
    id: 3,
    title: "빗속 예선",
    tag: "저마찰 예선",
    trackId: "arena",
    arenaPreset: "wet-qualifying",
    laps: 2,
    difficulty: "Hard",
    targetLapTime: 82,
    sectorTargets: [27.6, 27.9, 26.5],
    brakeHint: "젖은 노면은 평소보다 20m 일찍 브레이크",
    goal: { type: "rankAtMost", rank: 4, label: "젖은 노면에서 4위 이상" },
    reward: "결승 예선 진출",
    briefing: [
      "갑작스러운 폭우로 아레나 노면이 차갑게 식었습니다.",
      "민 대표는 안정 주행을 지시하지만, 서윤은 지금이 앞줄을 훔칠 기회라고 판단합니다."
    ],
    introCutscene: [
      frame("pressRoom", "빗소리", "린", "비가 오면 겁먹는 드라이버부터 순위표에서 사라져요."),
      frame("pit", "갈라진 피트월", "민 대표", "4위 안에만 넣으세요. 차를 잃으면 결승도 없습니다."),
      frame("teamRadio", "엔지니어 채널", "서윤", "안전하게만 가면 린을 못 잡아요. 짧은 드리프트, 빠른 탈출. 우리는 공격해야 합니다."),
      frame("grid", "젖은 그리드", "도윤", "노면 온도 낮습니다. 첫 랩은 차를 깨우고, 두 번째 랩에서 시간을 뽑아요.")
    ],
    midRaceDrama: [
      { at: 3, speaker: "도윤", text: "트랙이 미끄럽습니다. 핸들을 한 번에 꺾지 말고 나눠서 넣어요." },
      { at: 30, speaker: "민 대표", text: "불필요한 공격 금지. 목표는 4위 이상입니다." },
      { at: 46, speaker: "서윤", text: "앞차가 방어 중이에요. 젖은 노면에서는 출구가 더 중요합니다." },
      { at: 70, speaker: "린", text: "비는 핑계가 아니라 필터예요. 남을 드라이버만 남죠." }
    ],
    successText: "빗속 예선 통과. 차고의 공기가 바뀝니다. 이제 운이 아니라 실력이라는 말이 들립니다.",
    failText: "젖은 노면이 발목을 잡았습니다. 예선은 다시 준비할 수 있지만, 팀의 압박은 더 커졌습니다.",
    successCutscene: [
      frame("podium", "비 그친 트랙", "서윤", "봤죠? 차를 지키면서도 공격할 수 있어요. 이제 피트월도 그걸 부정 못 합니다."),
      frame("pit", "대표의 침묵", "민 대표", "좋습니다. 하지만 다음엔 팀 지시가 더 복잡해질 겁니다."),
      frame("pressRoom", "라이벌의 시선", "린", "흥미롭네요. 아스터의 루키가 빗속에서 살아남았군요.")
    ],
    failCutscene: [
      frame("pit", "젖은 데이터 시트", "민 대표", "위험을 감수했으면 결과가 있어야 합니다."),
      frame("garage", "젖은 타이어", "서윤", "차는 돌아왔고 데이터도 남았어요. 다음 시도에서는 미끄러짐을 무기로 바꿉시다.")
    ]
  },
  {
    id: 4,
    title: "팀 오더",
    tag: "피트월 갈등",
    trackId: "arena",
    arenaPreset: "team-order",
    laps: 2,
    difficulty: "Hard",
    targetLapTime: 75.8,
    sectorTargets: [24.8, 25.7, 25.3],
    brakeHint: "팀 오더 구간은 방어보다 코너 탈출 속도 유지",
    rivalName: "하진",
    goal: { type: "rankAtMost", rank: 2, label: "팀 지시 속에서 2위 이상" },
    reward: "파이널 스타팅 권한",
    briefing: [
      "아스터는 안정적인 포인트를 원하고, 하진은 자신에게 길을 열라고 요구합니다.",
      "팀 오더가 내려와도 2위 이상을 기록하면 결승 전략을 직접 선택할 권리를 얻습니다."
    ],
    introCutscene: [
      frame("pit", "전략실", "민 대표", "오늘은 하진의 포인트가 우선입니다. 상황이 오면 길을 열어요."),
      frame("garage", "끊긴 대화", "하진", "팀이 드디어 현실을 보네. 루키는 루키답게 배우면 돼."),
      frame("teamRadio", "비공식 채널", "서윤", "규정 안에서 싸워요. 팀 오더를 어기라는 말은 못 하지만, 당신의 가치는 결과로만 보호됩니다."),
      frame("grid", "뜨거운 스타트 라인", "도윤", "2위 이상이면 대표도 말을 바꿔야 합니다. 차분하게, 하지만 물러서지 마세요.")
    ],
    midRaceDrama: [
      { at: 5, speaker: "민 대표", text: "하진이 뒤에 있습니다. 위치를 바꿀 준비를 하세요." },
      { at: 24, speaker: "하진", text: "들었지? 팀이 원하는 대로 해." },
      { at: 42, speaker: "서윤", text: "앞차와 간격이 줄고 있어요. 결과가 나오면 누구도 쉽게 말 못 합니다." },
      { at: 66, speaker: "도윤", text: "마지막 섹터입니다. 브레이크를 믿고 들어가요." }
    ],
    successText: "피트월의 침묵 뒤, 서윤이 말합니다. '이제 결승 전략은 우리가 잡아요.'",
    failText: "안전한 레이스였지만 충분히 날카롭지 못했습니다. 결승 권한은 아직 피트월에 남았습니다.",
    successCutscene: [
      frame("pressRoom", "불편한 기자회견", "민 대표", "오늘 결과는 명확합니다. 파이널 전략 선택권은 루키에게 있습니다."),
      frame("garage", "하진의 헬멧", "하진", "팀이 널 밀어준 게 아니야. 네가 팀을 밀어낸 거지."),
      frame("teamRadio", "늦은 밤 차고", "서윤", "이제 마지막입니다. 다음 레이스에서는 아무도 당신 뒤에 숨지 못해요.")
    ],
    failCutscene: [
      frame("pit", "닫힌 모니터", "민 대표", "팀 오더는 결과를 위한 겁니다. 오늘은 그 판단을 바꿀 이유가 없군요."),
      frame("garage", "서윤의 노트", "서윤", "분한 건 좋아요. 그 감정을 다음 브레이킹 포인트까지 가져갑시다.")
    ]
  },
  {
    id: 5,
    title: "마지막 브레이킹",
    tag: "시즌 파이널",
    trackId: "arena",
    arenaPreset: "grand-final",
    laps: 3,
    difficulty: "Hard",
    targetLapTime: 74,
    sectorTargets: [24.2, 25.1, 24.7],
    brakeHint: "마지막 섹터 S자에서 가속을 끊지 않기",
    rivalName: "린",
    goal: { type: "rankAtMost", rank: 1, label: "아레나 파이널 우승" },
    reward: "스토리 시즌 클리어",
    briefing: [
      "관중석이 가득 찬 결승 무대. 아스터의 루키와 경쟁 팀 에이스 린이 같은 앞줄에 섭니다.",
      "체커를 가장 먼저 받아야 시즌 결승 초대장과 이야기의 주인공 자리를 얻습니다."
    ],
    introCutscene: [
      frame("grid", "파이널 그리드", "린", "결승은 이야기가 아니라 기록으로 남습니다. 기록은 냉정하죠."),
      frame("pit", "아스터 피트월", "민 대표", "오늘 이기면 아스터의 시즌은 성공입니다. 지면 그저 좋은 성장담으로 남겠죠."),
      frame("garage", "마지막 장갑", "하진", "린을 잡아. 그래야 내가 진 상대가 진짜였다는 뜻이 되니까."),
      frame("teamRadio", "출발 10초 전", "서윤", "첫 레이스에서 말했죠. 운전대가 대답할 차례라고. 이제 마지막 대답입니다."),
      frame("grid", "다섯 개의 레드 라이트", "도윤", "아스터 그랑프리 아레나, 파이널 레이스. 준비하세요.")
    ],
    midRaceDrama: [
      { at: 3, speaker: "도윤", text: "마지막 레이스입니다. 첫 랩은 침착하게, 마지막 랩은 과감하게." },
      { at: 38, speaker: "린", text: "따라오는 건 쉽죠. 추월하는 순간부터 진짜가 시작됩니다." },
      { at: 82, speaker: "서윤", text: "당신이 여기까지 온 이유를 보여줘요. 라인은 열려 있습니다." },
      { at: 120, speaker: "민 대표", text: "아스터의 모든 카메라가 당신을 보고 있습니다. 끝까지 밀어붙이세요." }
    ],
    successText: "체커 플래그가 흔들립니다. 아스터의 루키 시즌은 우승으로 끝났고, 결승 초대장은 이제 당신의 것입니다.",
    failText: "파이널 우승은 놓쳤지만 차이는 종이 한 장입니다. 다시 그리드에 서면 이야기는 바뀔 수 있습니다.",
    successCutscene: [
      frame("podium", "체커 플래그", "도윤", "확인했습니다. 1위. 아스터 루키가 아레나 파이널을 가져갑니다."),
      frame("pressRoom", "카메라 플래시", "린", "오늘은 당신 기록이 더 빨랐어요. 다음 시즌엔 제가 그 기록을 지우죠."),
      frame("garage", "아스터의 밤", "서윤", "루키 시즌은 끝났어요. 이제 모두가 당신을 루키라고 부르기 어려울 겁니다."),
      frame("podium", "시즌 초대장", "민 대표", "결승 초대장입니다. 아스터는 이제 당신을 중심으로 움직입니다.")
    ],
    failCutscene: [
      frame("podium", "멀어진 우승대", "린", "좋은 이야기는 들었어요. 하지만 오늘 기록은 제 이름으로 남습니다."),
      frame("garage", "정적", "서윤", "졌지만 끝난 건 아니에요. 당신은 이제 파이널을 어떻게 이겨야 하는지 압니다.")
    ]
  }
];

const PART_B_OVERRIDES = {
  1: {
    partId: "B",
    partLabel: "B",
    title: "첫 시트: 엔진 경고",
    tag: "재테스트",
    laps: 1,
    targetLapTime: 79.5,
    sectorTargets: [26.2, 27.0, 26.3],
    brakeHint: "경고등이 떠도 2코너 연석은 밟지 말고 부드럽게 탈출",
    goal: { type: "rankAtMost", rank: 4, label: "엔진 경고 상황에서 4위 이상" },
    introVideo: "./assets/cinematics/ch01b_intro.webm",
    outroVideo: "./assets/cinematics/ch01b_outro.webm",
    briefing: [
      "계약 테스트 직후 예기치 않은 엔진 경고가 기록됩니다.",
      "민 대표는 운이었는지 실력이었는지 다시 확인하겠다고 말합니다."
    ],
    introCutscene: [
      frame("garage", "경고등", "도윤", "전기 계통 경고가 한 번 떴습니다. 안전 모드로 들어가면 직선에서 손해가 큽니다."),
      frame("pit", "대표의 재테스트", "민 대표", "한 번 빠른 건 누구나 할 수 있습니다. 문제가 생겼을 때도 결과를 내면 계약은 흔들리지 않습니다."),
      frame("teamRadio", "서윤의 판단", "서윤", "차를 믿되 억지로 밀지 마요. 부드러운 조작이 오늘은 가장 빠른 길입니다.")
    ],
    midRaceDrama: [
      { at: 8, speaker: "도윤", text: "출력이 잠깐 흔들렸습니다. 코너 탈출을 깔끔하게 가져가면 만회됩니다.", condition: "time" },
      { at: 32, speaker: "서윤", text: "앞차 둘이 서로 막고 있어요. 브레이킹을 늦추지 말고 출구에서 지나가요.", condition: "rankAtMost", rank: 6 }
    ],
    successText: "문제가 생긴 차로도 기록을 지켰습니다. 아스터 차고는 이제 당신을 테스트 드라이버가 아니라 선수로 대합니다.",
    failText: "경고등 하나에 리듬이 무너졌습니다. 서윤은 차보다 마음의 흔들림을 먼저 고치자고 말합니다.",
    successCutscene: [
      frame("garage", "열린 계약서", "서윤", "엔진 경고가 있었는데도 페이스를 잃지 않았어요. 이건 좋은 신호입니다."),
      frame("pressRoom", "첫 서명", "민 대표", "루키 시트는 확정입니다. 다음부터는 같은 차고 안의 경쟁도 견뎌야 합니다.")
    ],
    failCutscene: [
      frame("garage", "꺼진 경고등", "서윤", "차는 고쳤습니다. 이제 흔들린 랩을 고칠 차례예요.")
    ]
  },
  2: {
    partId: "B",
    partLabel: "B",
    title: "같은 차고의 적: 접촉 사고",
    tag: "책임 공방",
    laps: 2,
    goal: { type: "beatRival", rival: "하진", label: "접촉 논란 뒤 하진보다 앞서기" },
    introVideo: "./assets/cinematics/ch02b_intro.webm",
    outroVideo: "./assets/cinematics/ch02b_outro.webm",
    briefing: [
      "하진과의 첫 대결 후, 피트레인 입구에서 가벼운 접촉 사고가 벌어집니다.",
      "팀은 둘 중 누가 더 냉정하게 다시 달릴 수 있는지 보려 합니다."
    ],
    introCutscene: [
      frame("pit", "리플레이 화면", "하진", "내 라인을 닫은 건 너야. 리플레이를 봐도 똑같아."),
      frame("pressRoom", "불편한 침묵", "민 대표", "책임은 결과 뒤에 묻겠습니다. 다시 붙어서 앞선 드라이버가 말하세요."),
      frame("teamRadio", "서윤의 경고", "서윤", "감정으로 핸들을 돌리면 또 부딪힙니다. 간격을 만들고 빠져나와요.")
    ],
    midRaceDrama: [
      { at: 14, speaker: "하진", text: "이번엔 핑계 없이 끝내자.", condition: "time" },
      { at: 48, speaker: "도윤", text: "하진과 1초 안입니다. 무리한 접촉보다 다음 직선이 좋습니다.", condition: "rivalNear", rival: "하진", distance: 1.2 }
    ],
    successText: "논란은 기록표 앞에서 힘을 잃었습니다. 하진은 처음으로 말을 아낍니다.",
    failText: "하진이 먼저 들어왔고 책임 공방은 더 커졌습니다. 팀의 차고는 둘로 갈라지기 시작합니다."
  },
  3: {
    partId: "B",
    partLabel: "B",
    title: "빗속 예선: 전략 실패",
    tag: "만회 주행",
    laps: 2,
    goal: { type: "rankAtMost", rank: 3, label: "잘못된 전략을 만회해 3위 이상" },
    introVideo: "./assets/cinematics/ch03b_intro.webm",
    outroVideo: "./assets/cinematics/ch03b_outro.webm",
    briefing: [
      "팀이 너무 늦게 타이어 전략을 바꾸며 예선 첫 시도가 망가집니다.",
      "남은 시간은 짧고, 서윤은 마지막 공격 랩을 요청합니다."
    ],
    introCutscene: [
      frame("pit", "늦은 전략 콜", "민 대표", "피트월 판단이 늦었습니다. 하지만 트랙 위에서 만회해야 하는 건 드라이버입니다."),
      frame("teamRadio", "서윤의 반박", "서윤", "우리가 늦었어요. 그래도 마지막 랩은 남았습니다. 미끄러짐을 두려워하지 마요."),
      frame("grid", "젖은 출구", "린", "좋은 팀은 드라이버를 구하고, 좋은 드라이버는 팀의 실수를 숨기죠.")
    ],
    midRaceDrama: [
      { at: 20, speaker: "도윤", text: "섹터 1은 목표보다 늦습니다. 섹터 2에서 회복해야 합니다.", condition: "sectorSlow", sector: 1 },
      { at: 58, speaker: "서윤", text: "좋아요, 이제 공격 랩입니다. 브레이크를 빨리 끝내고 차를 세워요.", condition: "time" }
    ],
    successText: "전략 실패를 덮은 건 피트월이 아니라 당신의 마지막 랩이었습니다.",
    failText: "마지막 랩은 충분하지 않았습니다. 팀 내부의 불신이 더 깊어집니다."
  },
  4: {
    partId: "B",
    partLabel: "B",
    title: "팀 오더: 거부의 대가",
    tag: "내부 충돌",
    laps: 2,
    goal: { type: "rankAtMost", rank: 2, label: "팀 압박 속에서 2위 이상 증명" },
    introVideo: "./assets/cinematics/ch04b_intro.webm",
    outroVideo: "./assets/cinematics/ch04b_outro.webm",
    briefing: [
      "팀 오더를 둘러싼 갈등은 공개 인터뷰까지 번집니다.",
      "민 대표는 결과로만 반박하라고 말하고, 하진은 당신의 선택을 기다립니다."
    ],
    introCutscene: [
      frame("pressRoom", "날카로운 질문", "민 대표", "팀보다 앞서는 드라이버는 없습니다. 단, 팀을 앞으로 끌고 가는 드라이버는 있죠."),
      frame("garage", "하진의 시선", "하진", "네가 진짜 빠르다면 팀 지시 뒤에 숨을 필요도 없겠지."),
      frame("teamRadio", "서윤의 낮은 목소리", "서윤", "오늘은 이겨야 조용해집니다. 말보다 랩타임이 강해요.")
    ],
    midRaceDrama: [
      { at: 22, speaker: "민 대표", text: "하진이 뒤에서 압박 중입니다. 팀 손실은 용납하지 않습니다.", condition: "time" },
      { at: 64, speaker: "서윤", text: "지금 페이스면 2위권입니다. 흔들리지 마요.", condition: "rankAtMost", rank: 3 }
    ],
    successText: "결과가 팀 오더보다 강해졌습니다. 파이널 전략권이 당신 쪽으로 넘어옵니다.",
    failText: "피트월은 다시 통제권을 가져갑니다. 결승 전, 당신의 선택지는 줄어듭니다."
  },
  5: {
    partId: "B",
    partLabel: "B",
    title: "마지막 브레이킹: 최종전",
    tag: "반전 결승",
    laps: 3,
    targetLapTime: 73.5,
    goal: { type: "rankAtMost", rank: 1, label: "최종전 우승" },
    introVideo: "./assets/cinematics/ch05b_intro.webm",
    outroVideo: "./assets/cinematics/ch05b_outro.webm",
    briefing: [
      "파이널 1차전 뒤, 린의 팀이 아스터의 전략을 완전히 읽었다는 사실이 드러납니다.",
      "마지막 경기는 순수한 속도와 브레이킹 싸움입니다. 1위만이 이야기를 끝낼 수 있습니다."
    ],
    introCutscene: [
      frame("pit", "노출된 전략", "도윤", "린 쪽이 우리 섹터별 브레이킹 데이터를 알고 있습니다. 예상 라인은 통하지 않습니다."),
      frame("garage", "하진의 조언", "하진", "그럼 예상 밖으로 달려. 네가 나를 이겼던 방식으로."),
      frame("grid", "마지막 그리드", "린", "이제 놀랄 일은 없겠죠. 당신의 다음 움직임까지 준비했습니다."),
      frame("teamRadio", "마지막 무전", "서윤", "준비된 상대에게는 완벽한 정답보다 살아 있는 판단이 필요합니다. 마지막 브레이킹, 당신이 정해요.")
    ],
    midRaceDrama: [
      { at: 36, speaker: "린", text: "그 라인은 이미 봤어요.", condition: "time" },
      { at: 88, speaker: "하진", text: "다음 헤어핀, 평소보다 안쪽. 넌 그걸 살릴 수 있어.", condition: "time" },
      { at: 126, speaker: "서윤", text: "마지막 섹터입니다. 차를 믿고 끝까지 밟아요.", condition: "time" }
    ],
    successText: "반전은 대사에서 나오지 않았습니다. 마지막 브레이킹 포인트에서, 당신이 직접 만들었습니다.",
    failText: "린이 최종전을 가져갔습니다. 하지만 이제 아스터는 다음 시즌을 당신 중심으로 다시 짜야 합니다."
  }
};

function makePartA(chapter) {
  return {
    partId: "A",
    partLabel: "A",
    title: `${chapter.title}: ${chapter.tag}`,
    tag: chapter.tag,
    trackId: chapter.trackId,
    arenaPreset: chapter.arenaPreset,
    laps: chapter.laps,
    difficulty: chapter.difficulty,
    targetLapTime: chapter.targetLapTime,
    sectorTargets: chapter.sectorTargets,
    brakeHint: chapter.brakeHint,
    rivalName: chapter.rivalName,
    goal: chapter.goal,
    reward: chapter.reward,
    briefing: chapter.briefing,
    introVideo: `./assets/cinematics/ch${String(chapter.id).padStart(2, "0")}a_intro.webm`,
    outroVideo: `./assets/cinematics/ch${String(chapter.id).padStart(2, "0")}a_outro.webm`,
    introCutscene: chapter.introCutscene,
    midRaceDrama: chapter.midRaceDrama,
    successText: chapter.successText,
    failText: chapter.failText,
    successCutscene: chapter.successCutscene,
    failCutscene: chapter.failCutscene
  };
}

function installStoryParts() {
  for (const chapter of STORY_CHAPTERS) {
    const partA = makePartA(chapter);
    const partB = {
      ...partA,
      ...PART_B_OVERRIDES[chapter.id],
      trackId: "arena",
      arenaPreset: `${chapter.arenaPreset}-incident`,
      difficulty: chapter.id >= 3 ? "Hard" : "Normal"
    };
    partA.sessions = makeWeekendSessions(chapter, partA, "A");
    partB.sessions = makeWeekendSessions(chapter, partB, "B");
    partB.fallbackSequence = partB.introCutscene;
    partB.outroFallbackSequence = partB.successCutscene || partA.successCutscene;
    partA.fallbackSequence = partA.introCutscene;
    partA.outroFallbackSequence = partA.successCutscene;
    chapter.parts = [partA, partB];
  }
}

installStoryParts();

export function loadStorySave() {
  const base = { unlockedChapter: 1, chapterPart: 1, chapterSession: 1, qualifyingResults: {}, cleared: [], clearedParts: [], clearedSessions: [], lastResult: null, seasonComplete: false };
  try {
    const parsed = JSON.parse(localStorage.getItem(STORY_SAVE_KEY) || "{}");
    return {
      ...base,
      ...parsed,
      chapterPart: clampPart(parsed.chapterPart),
      chapterSession: clampSession(parsed.chapterSession),
      qualifyingResults: parsed.qualifyingResults && typeof parsed.qualifyingResults === "object" ? parsed.qualifyingResults : {},
      cleared: Array.isArray(parsed.cleared) ? parsed.cleared : [],
      clearedParts: Array.isArray(parsed.clearedParts) ? parsed.clearedParts : [],
      clearedSessions: Array.isArray(parsed.clearedSessions) ? parsed.clearedSessions : []
    };
  } catch {
    return base;
  }
}

export function storeStorySave(save) {
  localStorage.setItem(STORY_SAVE_KEY, JSON.stringify(save));
}

export function chapterById(id, part = 1, session = 1) {
  const chapter = STORY_CHAPTERS.find(chapter => chapter.id === Number(id)) || STORY_CHAPTERS[0];
  const partIndex = clampPart(part);
  const partData = chapter.parts?.[partIndex - 1] || chapter.parts?.[0] || {};
  const sessionIndex = clampSession(session);
  const sessionData = partData.sessions?.[sessionIndex - 1] || partData.sessions?.[0] || {};
  const title = sessionData.title || partData.title || chapter.title;
  return {
    ...chapter,
    ...partData,
    ...sessionData,
    id: chapter.id,
    title,
    chapterTitle: chapter.title,
    partIndex,
    partId: partData.partId || "A",
    partLabel: partData.partLabel || "A",
    sessionIndex,
    sessions: partData.sessions || [],
    parts: chapter.parts || []
  };
}

export function describeGoal(goal) {
  if (!goal) return "완주";
  if (goal.label) return goal.label;
  if (goal.type === "rankAtMost") return `${goal.rank}위 이상`;
  if (goal.type === "beatRival") return `${goal.rival}보다 앞서기`;
  if (goal.type === "lapTimeAtMost") return `${goal.time}s 이내 랩`;
  return "레이스 완주";
}

export function arenaLabel() {
  return arenaName;
}

function clampPart(value) {
  return Math.max(1, Math.min(2, Number(value) || 1));
}

function clampSession(value) {
  return Math.max(1, Math.min(3, Number(value) || 1));
}

function makeWeekendSessions(chapter, part, partLabel) {
  const suffix = `${String(chapter.id).padStart(2, "0")}${partLabel.toLowerCase()}`;
  const trackId = STORY_TRACK_BY_CHAPTER[chapter.id] || part.trackId || "arena";
  const weather = STORY_WEATHER_BY_CHAPTER[chapter.id] || "clear";
  const practiceTarget = Math.round((part.targetLapTime || chapter.targetLapTime || 78) * 1.13);
  const qualifyingRank = chapter.id >= 5 ? 3 : chapter.id >= 3 ? 5 : 6;
  const tireRule = weather === "wet" ? "intermediate" : chapter.id >= 5 ? "soft-medium" : "medium";
  return [
    {
      sessionId: "practice",
      sessionType: "Practice",
      sessionLabel: "연습",
      title: `${part.title} · 연습`,
      tag: "Practice",
      trackId,
      weather,
      laps: 1,
      targetLapTime: practiceTarget,
      sectorTargets: splitTarget(practiceTarget),
      goal: { type: "lapTimeAtMost", time: practiceTarget, label: `연습 랩 ${practiceTarget}s 이내` },
      gridRule: "pit-exit",
      tireRule,
      storyFlags: ["setup", "learning"],
      introVideo: `./assets/cinematics/ch${suffix}_practice_intro.webm`,
      incidentVideo: `./assets/cinematics/ch${suffix}_practice_incident.webm`,
      outroVideo: `./assets/cinematics/ch${suffix}_practice_outro.webm`,
      briefing: [...(part.briefing || []), "연습 세션은 타이어와 브레이크 포인트를 익히는 시간입니다."],
      introCutscene: part.introCutscene,
      midRaceDrama: [{ at: 5, speaker: "도윤", text: "연습 세션입니다. 타이어 온도를 올리고 브레이크 포인트를 확인하세요.", condition: "time" }, ...(part.midRaceDrama || []).slice(0, 1)],
      successText: "연습 데이터가 쌓였습니다. 피트월은 예선 세팅을 확정합니다.",
      failText: "연습 기록이 목표보다 느립니다. 같은 세션을 다시 뛰며 브레이크 포인트를 잡아야 합니다.",
      successCutscene: [frame("pit", "세팅 확정", "서윤", "좋아요. 데이터가 충분합니다. 이제 예선에서 한 랩을 제대로 묶어봅시다.")],
      failCutscene: [frame("garage", "세팅 재점검", "도윤", "타이어 온도와 브레이크 포인트가 아직 맞지 않습니다. 한 번 더 갑시다.")]
    },
    {
      sessionId: "qualifying",
      sessionType: "Qualifying",
      sessionLabel: "예선",
      title: `${part.title} · 예선`,
      tag: "Qualifying",
      trackId,
      weather,
      laps: 1,
      targetLapTime: part.targetLapTime || chapter.targetLapTime,
      sectorTargets: part.sectorTargets || chapter.sectorTargets,
      goal: { type: "rankAtMost", rank: qualifyingRank, label: `예선 ${qualifyingRank}위 이상` },
      gridRule: "hot-lap",
      tireRule,
      storyFlags: ["grid", "pressure"],
      introVideo: `./assets/cinematics/ch${suffix}_qualifying_intro.webm`,
      incidentVideo: `./assets/cinematics/ch${suffix}_qualifying_incident.webm`,
      outroVideo: `./assets/cinematics/ch${suffix}_qualifying_outro.webm`,
      briefing: [...(part.briefing || []), "예선 결과는 결승 스타팅 그리드에 반영됩니다."],
      introCutscene: [frame("grid", "예선 출격", "도윤", "한 랩입니다. 출구 속도와 섹터 2의 급커브가 순위를 결정합니다.", "grid", "push"), ...(part.introCutscene || []).slice(0, 2)],
      midRaceDrama: [{ at: 8, speaker: "서윤", text: "타이어가 준비됐어요. 다음 급커브에서 차를 세우고 바로 열어주세요.", condition: "time" }, ...(part.midRaceDrama || []).slice(0, 2)],
      successText: "예선 목표를 달성했습니다. 결승 그리드가 유리해집니다.",
      failText: "예선 순위가 부족합니다. 결승 전에 다시 한 랩을 묶어야 합니다.",
      successCutscene: [frame("pressRoom", "예선 결과", "민 대표", "좋습니다. 결승 그리드에서 싸울 위치를 만들었습니다.")],
      failCutscene: [frame("pit", "예선 재검토", "서윤", "섹터를 따로 보면 속도는 있어요. 이제 한 랩으로 연결해야 합니다.")]
    },
    {
      sessionId: "race",
      sessionType: "Race",
      sessionLabel: "결승",
      title: `${part.title} · 결승`,
      tag: "Race",
      trackId,
      weather,
      laps: Math.max(2, part.laps || chapter.laps || 2),
      targetLapTime: part.targetLapTime || chapter.targetLapTime,
      sectorTargets: part.sectorTargets || chapter.sectorTargets,
      goal: part.goal,
      gridRule: "qualifying-result",
      tireRule,
      storyFlags: ["race", "pit", "drs", "penalty"],
      introVideo: part.introVideo || `./assets/cinematics/ch${suffix}_race_intro.webm`,
      incidentVideo: part.incidentVideo || `./assets/cinematics/ch${suffix}_race_incident.webm`,
      outroVideo: part.outroVideo || `./assets/cinematics/ch${suffix}_race_outro.webm`,
      briefing: part.briefing,
      introCutscene: part.introCutscene,
      midRaceDrama: part.midRaceDrama,
      successText: part.successText,
      failText: part.failText,
      successCutscene: part.successCutscene,
      failCutscene: part.failCutscene
    }
  ];
}

function splitTarget(total) {
  const a = Math.round(total * .33 * 10) / 10;
  const b = Math.round(total * .34 * 10) / 10;
  return [a, b, Math.round((total - a - b) * 10) / 10];
}
