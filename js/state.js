'use strict';
// CoachBoard Pro - Global State
var lang = 'ar', sport = 'futsal', tool = 'select', curTeam = 'A', theme = 'dark';
var els = [], selIds = new Set(), nCnt = 1, grpCnt = 1, clipboard = [];
var dragging = false, dragEl = null, dragOff = { x: 0, y: 0 };
var _dragStarts = null, _motionPrev = {};
var drawingArr = false, arrS = null, arrP = null;
var drawingFree = false, freePoints = [];
var guides = [], hist = [], hI = -1;
var steps = [], activeStep = -1, animPlaying = false, animRAF = null;
var zoomLevel = 1, gridSnap = false, gridSize = 20;
var pitchColors = { futsal: '#1a7a3a', football: '#1a7a3a', beach: '#d4b56a', mini: '#1a7a3a', basketball: '#c06020', volleyball: '#2060a0', handball: '#1a7a3a' };
var customPitchColor = null;
var rubberBanding = false, rbStart = null;
var panX = 0, panY = 0, panning = false, panLastX = 0, panLastY = 0, pitchRotating = false, pitchRotStartX = 0, pitchRotStartY = 0, pitchRotStartRX = 0, pitchRotStartRY = 0;
var multiArrPoints = null; var draggingPoint = null;
var teamFormations = { A: null, B: null };
var teamFormationProps = { A: null, B: null };
var teamNames = { A: '', B: '' };
var teamScores = { A: 0, B: 0 };
var formationDefs = { futsal: [['121', '1-2-1'], ['130', '1-3-0'], ['211', '2-1-1'], ['31', '3-1'], ['40', '4-0']], football: [['442', '4-4-2'], ['433', '4-3-3'], ['352', '3-5-2'], ['4231', '4-2-3-1']], beach: [['22', '2-2'], ['121', '1-2-1'], ['31', '3-1']], mini: [['21', '2-1'], ['12', '1-2'], ['22', '2-2']], basketball: [['5', '5'], ['131', '1-3-1'], ['212', '2-1-2']], volleyball: [['42', '4-2'], ['33', '3-3']], handball: [['60', '6-0'], ['51', '5-1'], ['33', '3-3']] };
var cv = document.getElementById('cv'), cx = cv ? cv.getContext('2d') : null, cc = document.getElementById('cc');
var W = 0, H = 0, dpr = 1;
var courtImgs = { futsal: null, football: null, beach: null, mini: null, basketball: null, volleyball: null, handball: null };
var playerDisplayStyle = 'circle';
var lastElProps = {
  player: { color: null, size: null, displayStyle: null },
  goalkeeper: { color: null, size: null, displayStyle: null },
  ball: { color: null, size: null },
  cone: { color: null, size: null },
  coneDisc: { color: null, size: null },
  coneTall: { color: null, size: null },
  ring: { color: null, size: null },
  barrier: { color: null, size: null },
  hurdle: { color: null, size: null },
  mannequin: { color: null, size: null },
  smallGoal: { color: null, size: null },
  flag: { color: null, size: null },
  ladder: { color: null, size: null },
  stick: { color: null, size: null },
  hurdleArc: { color: null, size: null },
  bib: { color: null, size: null },
  reboundBoard: { color: null, size: null },
  zone: { color: null, size: null }
};
var customIcons = {};
var customIconImages = {};
var handleDrag = null;
var _autoSaveTimer = null;
var _resizeTimer = null;
var _ecntLast = -1;
var pitch3d = false; var pitchRotX = 0; var pitchRotY = 0;
var pitchRotation = 0; var pitchOrientation = 'landscape'; var directionOfPlay = 0;
var fieldStyle = 'svg';
var pitchPerspective = { enabled: false, tilt: 8, scaleDiff: 0.10 };
var teamLogos = { A: null, B: null };
var teamLogoOpacity = { A: 0.15, B: 0.15 };
var coachInfo = { name: '', logo: null, logoOpacity: 0.15, logoX: 0.5, logoY: 0.92, logoSize: 80 };
var favoriteColors = [];
var playerLinks = [];
var drawingLink = false, linkStart = null, linkEnd = null;
var teamRosters = {};
var activeRoster = null;
var teamRosterAssignment = { A: null, B: null };
var showPlayerNames = true;
var toolTemplates = {};
var posZonePhase = 0;
var spinRingPhase = 0;
var spotlightPhase = 0;
var _pitchAnimPhase = 0;
var _dirty = true, _rafId = null;
var _hasActiveAnimations = false;
var _exportActive = false;
var rbDiv = document.getElementById('rubberBand');
var trails = {};
var _shapeDrag = null;
