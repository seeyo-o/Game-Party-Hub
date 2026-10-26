/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME 3: "GUESS WHO? BATTLE ROYALE"
 * ==========================================================================
 * Permainan tebak karakter & deduksi eliminasi cepat bergaya Battle Royale.
 * Tema: Sky Ice (#F0F7FF), Royal Sky (#0284C7), Vivid Violet (#8B5CF6).
 */

const GuessWhoGame = (function () {
  'use strict';

  // ==========================================================================
  // 1. CHARACTER SERVICE (API FETCHER & CURATED FALLBACK DECKS)
  // ==========================================================================
  const CharacterService = {
    // Curated High-Quality Fallback Decks (Guarantees zero-failure & instant loading)
    DECKS: {
  "all-popular": [
    {
      "id": "pop_127691",
      "name": "Satoru Gojou",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b127691-9zqh1xpIubn7.png"
    },
    {
      "id": "pop_45627",
      "name": "Levi",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b45627-CR68RyZmddGG.png"
    },
    {
      "id": "pop_40",
      "name": "Luffy D. Monkey",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png"
    },
    {
      "id": "pop_27",
      "name": "Killua Zoldyck",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b27-Z5O02kQUydpT.jpg"
    },
    {
      "id": "pop_40882",
      "name": "Eren Yeager",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b40882-dsj7IP943WFF.jpg"
    },
    {
      "id": "pop_62",
      "name": "Zoro Roronoa",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b62-S7oAeA9WInjV.png"
    },
    {
      "id": "pop_417",
      "name": "Lelouch Lamperouge",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b417-gVLmIJu9phcK.png"
    },
    {
      "id": "pop_88572",
      "name": "Emilia",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b88572-IzTwXEHSobRs.jpg"
    },
    {
      "id": "pop_71",
      "name": "L Lawliet",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b71-1W4panC53vfs.png"
    },
    {
      "id": "pop_87275",
      "name": "Ken Kaneki",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b87275-mb13EWZBdbh3.png"
    },
    {
      "id": "pop_40881",
      "name": "Mikasa Ackerman",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b40881-F3gr1PkreDvj.png"
    },
    {
      "id": "pop_89334",
      "name": "Arataka Reigen",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b89334-OPj1hCzvrt7X.png"
    },
    {
      "id": "pop_422",
      "name": "Guts",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b422-XTaiTuvRohsV.png"
    },
    {
      "id": "pop_126824",
      "name": "Maomao",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b126824-MqsCncTO1qpv.png"
    },
    {
      "id": "pop_176754",
      "name": "Frieren",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b176754-PCnpqIOkjhFk.png"
    },
    {
      "id": "pop_34470",
      "name": "Kurisu Makise",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b34470-Jw2LXZBL5R8i.png"
    },
    {
      "id": "pop_10138",
      "name": "Thorfinn Karlsefni",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b10138-zOPrka0ddZOR.png"
    },
    {
      "id": "pop_137080",
      "name": "Makima",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b137080-UHcynYNjb5ZU.png"
    },
    {
      "id": "pop_14",
      "name": "Itachi Uchiha",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b14-9Kb1E5oel1ke.png"
    },
    {
      "id": "pop_85",
      "name": "Kakashi Hatake",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b85-mkVBh2yjxjmx.png"
    },
    {
      "id": "pop_127222",
      "name": "Mai Sakurajima",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b127222-Jh5hhP7vZ7s1.png"
    },
    {
      "id": "pop_127212",
      "name": "Yuuji Itadori",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b127212-FVm2tD0erQ5B.png"
    },
    {
      "id": "pop_35252",
      "name": "Rintarou Okabe",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b35252-DY9TW6pusqeh.png"
    },
    {
      "id": "pop_130102",
      "name": "Denji",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b130102-FO1VHNnEnLlB.png"
    },
    {
      "id": "pop_28",
      "name": "Kurapika",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b28-ivA7UGnfE40a.png"
    },
    {
      "id": "pop_80",
      "name": "Light Yagami",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b80-26EhwSsSqQ50.png"
    },
    {
      "id": "pop_89616",
      "name": "Shigeo Kageyama",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b89616-dXmdOc7L6SDi.png"
    },
    {
      "id": "pop_120649",
      "name": "Kaguya Shinomiya",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b120649-NPaWaIpWy60E.png"
    },
    {
      "id": "pop_137079",
      "name": "Power",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b137079-6yLEUYR3bmpr.png"
    },
    {
      "id": "pop_90169",
      "name": "Violet Evergarden",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b90169-4wr1Zehnsac8.png"
    },
    {
      "id": "pop_11",
      "name": "Edward Elric",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b11-TA5Nuk7EDUZG.jpg"
    },
    {
      "id": "pop_17",
      "name": "Naruto Uzumaki",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png"
    },
    {
      "id": "pop_126071",
      "name": "Tanjirou Kamado",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b126071-BTNEc1nRIv68.png"
    },
    {
      "id": "pop_500",
      "name": "Sakura Matou",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b500-NQrLbnBr1sDv.png"
    },
    {
      "id": "pop_126635",
      "name": "Megumi Fushiguro",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b126635-L0y3I92JSUkN.png"
    },
    {
      "id": "pop_133676",
      "name": "Marin Kitagawa",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b133676-kV2czE3C8Qls.png"
    },
    {
      "id": "pop_89220",
      "name": "Shouto Todoroki",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b89220-KNBwaVFAR8FD.png"
    },
    {
      "id": "pop_6356",
      "name": "Joseph Joestar",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b6356-RImEfUfHpC58.png"
    },
    {
      "id": "pop_89361",
      "name": "Megumin",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b89361-tq8PQQ4MmF0M.png"
    },
    {
      "id": "pop_13020",
      "name": "Askeladd",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b13020-ZdiYlNmpRUNS.png"
    },
    {
      "id": "pop_88892",
      "name": "Katsuki Bakugou",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b88892-bdOha3lNcaN6.png"
    },
    {
      "id": "pop_88575",
      "name": "Rem",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b88575-Ayu8UPDA8NS6.png"
    },
    {
      "id": "pop_89198",
      "name": "Osamu Dazai",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b89198-qKmRTw4Y3PRC.png"
    },
    {
      "id": "pop_121103",
      "name": "Chika Fujiwara",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b121103-UGLxT8utLPnq.png"
    },
    {
      "id": "pop_126375",
      "name": "Itsuki Nakano",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b126375-dEe9IyQ9By09.png"
    },
    {
      "id": "pop_672",
      "name": "Gintoki Sakata",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b672-cP5VPriN67xJ.png"
    },
    {
      "id": "pop_88573",
      "name": "Subaru Natsuki",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b88573-F8yMTK9GhnTA.png"
    },
    {
      "id": "pop_124382",
      "name": "Ichigo",
      "role": "Karakter Anime Populer",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124382-bSBkjtYjJQtr.png"
    }
  ],
  "naruto": [
    {
      "id": "naruto_13",
      "name": "Sasuke Uchiha",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b13-SISLEw1oAD7a.png"
    },
    {
      "id": "naruto_17",
      "name": "Naruto Uzumaki",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png"
    },
    {
      "id": "naruto_85",
      "name": "Kakashi Hatake",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b85-mkVBh2yjxjmx.png"
    },
    {
      "id": "naruto_145",
      "name": "Sakura Haruno",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b145-IorfpI8arxeX.png"
    },
    {
      "id": "naruto_14",
      "name": "Itachi Uchiha",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b14-9Kb1E5oel1ke.png"
    },
    {
      "id": "naruto_306",
      "name": "Rock Lee",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b306-oUTOO45xInXt.png"
    },
    {
      "id": "naruto_307",
      "name": "Guy Might",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b307-xieUEdhdTVwQ.png"
    },
    {
      "id": "naruto_728",
      "name": "Zabuza Momochi",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b728-zHw77BzLzQKT.jpg"
    },
    {
      "id": "naruto_809",
      "name": "Anko Mitarashi",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b809-FhWTN0LFVzRa.png"
    },
    {
      "id": "naruto_1555",
      "name": "Hinata Hyuuga",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b1555-Q41GLTV3FvYF.png"
    },
    {
      "id": "naruto_1662",
      "name": "Gaara",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b1662-4E5J0LX9jZKZ.png"
    },
    {
      "id": "naruto_1694",
      "name": "Neji Hyuuga",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b1694-TL4obouDwJ7k.jpg"
    },
    {
      "id": "naruto_1902",
      "name": "Deidara",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b1902-JsEFRFwjmtZJ.png"
    },
    {
      "id": "naruto_2007",
      "name": "Shikamaru Nara",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2007-QaesJlIZDifj.jpg"
    },
    {
      "id": "naruto_2008",
      "name": "Chouji Akimichi",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n2008-j1oCafEGZucg.png"
    },
    {
      "id": "naruto_2009",
      "name": "Ino Yamanaka",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2009-H7n38Ns1fr0Y.jpg"
    },
    {
      "id": "naruto_2011",
      "name": "Iruka Umino",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2011-WUBm7wMCA6cE.png"
    },
    {
      "id": "naruto_2039",
      "name": "Haku",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2039-9NXBvh6H15LD.png"
    },
    {
      "id": "naruto_2174",
      "name": "Temari",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2174-XTX0TtzkZCnO.png"
    },
    {
      "id": "naruto_2405",
      "name": "Kabuto Yakushi",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2405-CqbcGW2tfaMV.png"
    },
    {
      "id": "naruto_2423",
      "name": "Jiraiya",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2423-RO5MyoXSA9OL.png"
    },
    {
      "id": "naruto_2455",
      "name": "Orochimaru",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n2455-V9tLMS3TIgJW.png"
    },
    {
      "id": "naruto_2672",
      "name": "Kisame Hoshigaki",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/2672-oxbHx8n3N7WY.jpg"
    },
    {
      "id": "naruto_2766",
      "name": "Pakkun",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n2766-kJfGu56HevA0.png"
    }
  ],
  "one-piece": [
    {
      "id": "onepiece_40",
      "name": "Luffy D. Monkey",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png"
    },
    {
      "id": "onepiece_61",
      "name": "Robin Nico",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b61-ywXUyyocEEqt.png"
    },
    {
      "id": "onepiece_62",
      "name": "Zoro Roronoa",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b62-S7oAeA9WInjV.png"
    },
    {
      "id": "onepiece_64",
      "name": "Franky",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n64-ChX6ZzHHjXqA.png"
    },
    {
      "id": "onepiece_305",
      "name": "Sanji",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b305-6lisPmHtCnLT.png"
    },
    {
      "id": "onepiece_309",
      "name": "Chopper Tony Tony",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b309-H64NhbJ2ywIQ.jpg"
    },
    {
      "id": "onepiece_723",
      "name": "Nami",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b723-vp5hPptgnNEC.png"
    },
    {
      "id": "onepiece_724",
      "name": "Usopp",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b724-GFGgI9AJQkfy.jpg"
    },
    {
      "id": "onepiece_5627",
      "name": "Brook",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b5627-av8oD3zhKvDl.png"
    },
    {
      "id": "onepiece_18938",
      "name": "Jinbe",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b18938-yZANEfjsVhW4.png"
    },
    {
      "id": "onepiece_725",
      "name": "Buggy",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n725-g04AaiaK5f9B.png"
    },
    {
      "id": "onepiece_726",
      "name": "Vivi Nefertari",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b726-DqAIpscMuYYx.png"
    },
    {
      "id": "onepiece_727",
      "name": "Shanks",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b727-wUJx7M1z5xON.png"
    },
    {
      "id": "onepiece_1541",
      "name": "Enel",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b1541-6c8RouunoL88.jpg"
    },
    {
      "id": "onepiece_2064",
      "name": "Dracule Mihawk",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n2064-OpnF4nLi6bvL.png"
    },
    {
      "id": "onepiece_2072",
      "name": "Ace D. Portgas",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2072-Lc6jEdsueJUK.jpg"
    },
    {
      "id": "onepiece_2519",
      "name": "Kuro",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2519-OfgRt6mP6Ae8.jpg"
    },
    {
      "id": "onepiece_2748",
      "name": "Bellamy",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2748-vnCKira7yjrp.jpg"
    },
    {
      "id": "onepiece_2749",
      "name": "Crocodile",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2749-e8ebEBN1SlS2.png"
    },
    {
      "id": "onepiece_2750",
      "name": "Tashigi",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2750-j3Rf9SC37ehT.jpg"
    },
    {
      "id": "onepiece_2751",
      "name": "Newgate Edward",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2751-NnzW0N2vCTjX.jpg"
    },
    {
      "id": "onepiece_2752",
      "name": "Kuzan",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2752-0ENS2a39muDz.png"
    },
    {
      "id": "onepiece_2753",
      "name": "Smoker",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2753-Y2ja8Pl6PRs0.jpg"
    },
    {
      "id": "onepiece_2754",
      "name": "Doflamingo Donquixote",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b2754-B4gGSlNYgsyh.jpg"
    }
  ],
  "jujutsu-kaisen": [
    {
      "id": "jujutsukaisen_126635",
      "name": "Megumi Fushiguro",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b126635-L0y3I92JSUkN.png"
    },
    {
      "id": "jujutsukaisen_127212",
      "name": "Yuuji Itadori",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b127212-FVm2tD0erQ5B.png"
    },
    {
      "id": "jujutsukaisen_127691",
      "name": "Satoru Gojou",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b127691-9zqh1xpIubn7.png"
    },
    {
      "id": "jujutsukaisen_133700",
      "name": "Nobara Kugisaki",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b133700-f6sOO3TcgLV6.png"
    },
    {
      "id": "jujutsukaisen_133699",
      "name": "Suguru Getou",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b133699-FCnXaISgazAi.png"
    },
    {
      "id": "jujutsukaisen_133701",
      "name": "Sukuna",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b133701-rCQuDpHr3UZL.png"
    },
    {
      "id": "jujutsukaisen_133702",
      "name": "Mahito",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b133702-Y7JRG5vAvjIL.png"
    },
    {
      "id": "jujutsukaisen_133704",
      "name": "Kento Nanami",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b133704-8wLTGjc234q2.png"
    },
    {
      "id": "jujutsukaisen_134167",
      "name": "Maki Zenin",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b134167-5TCytk45YByD.png"
    },
    {
      "id": "jujutsukaisen_134168",
      "name": "Mai Zenin",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b134168-FdWz5w2LqpeF.jpg"
    },
    {
      "id": "jujutsukaisen_137974",
      "name": "Panda",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b137974-9qnK3DPrvLKh.jpg"
    },
    {
      "id": "jujutsukaisen_137975",
      "name": "Aoi Toudou",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b137975-6TH7PiLWJaqy.png"
    },
    {
      "id": "jujutsukaisen_156848",
      "name": "Kasumi Miwa",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b156848-Rf0tuoQCNyZV.png"
    },
    {
      "id": "jujutsukaisen_156991",
      "name": "Jougo",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b156991-niYjdp9CxO4w.png"
    },
    {
      "id": "jujutsukaisen_157115",
      "name": "Toge Inumaki",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b157115-kdhRYQdVhH95.png"
    },
    {
      "id": "jujutsukaisen_157116",
      "name": "Chousou",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b157116-2jYQf3y8NeTZ.png"
    },
    {
      "id": "jujutsukaisen_157214",
      "name": "Junpei Yoshino",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b157214-ROBNoXVEXRNy.jpg"
    },
    {
      "id": "jujutsukaisen_157215",
      "name": "Mei Mei",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b157215-I3TQJu8nkDwD.jpg"
    },
    {
      "id": "jujutsukaisen_157864",
      "name": "Utahime Iori",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b157864-rejVYNx0kQZr.jpg"
    },
    {
      "id": "jujutsukaisen_157865",
      "name": "Takuma Ino",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b157865-X9ENX9OzWevS.jpg"
    },
    {
      "id": "jujutsukaisen_157866",
      "name": "Noritoshi  Kamo",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b157866-UWDtYBoG71PD.png"
    },
    {
      "id": "jujutsukaisen_157867",
      "name": "Yoshinobu Gakuganji",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b157867-dHdd8ZECuzHx.png"
    },
    {
      "id": "jujutsukaisen_157868",
      "name": "Momo Nishimiya",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b157868-Ui2Wht3M6tlM.png"
    },
    {
      "id": "jujutsukaisen_158154",
      "name": "Shouko Ieiri",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b158154-UCqbiULli62P.png"
    }
  ],
  "aot": [
    {
      "id": "attackontitan_40881",
      "name": "Mikasa Ackerman",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b40881-F3gr1PkreDvj.png"
    },
    {
      "id": "attackontitan_40882",
      "name": "Eren Yeager",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b40882-dsj7IP943WFF.jpg"
    },
    {
      "id": "attackontitan_46494",
      "name": "Armin Arlert",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b46494-g7xYYuBtYPnO.png"
    },
    {
      "id": "attackontitan_45627",
      "name": "Levi",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b45627-CR68RyZmddGG.png"
    },
    {
      "id": "attackontitan_45887",
      "name": "Sasha Blouse",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b45887-QPtJH0KwqthW.jpg"
    },
    {
      "id": "attackontitan_46484",
      "name": "Reiner Braun",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b46484-P6A2GjNQn49F.png"
    },
    {
      "id": "attackontitan_46486",
      "name": "Connie Springer",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n46486-izhPjzut6WCZ.png"
    },
    {
      "id": "attackontitan_46488",
      "name": "Bertolt Hoover",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b46488-wm6HvkdkHoZu.jpg"
    },
    {
      "id": "attackontitan_46490",
      "name": "Annie Leonhart",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b46490-tan274Ifc1Jf.jpg"
    },
    {
      "id": "attackontitan_46492",
      "name": "Hannes",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b46492-5kRaMLDCVD0B.jpg"
    },
    {
      "id": "attackontitan_46496",
      "name": "Erwin Smith",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b46496-Mu86MENd5wNB.png"
    },
    {
      "id": "attackontitan_46498",
      "name": "Jean Kirstein",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b46498-ritqAj9FW6jX.png"
    },
    {
      "id": "attackontitan_62475",
      "name": "Carla Yeager",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n62475-CExspVnLfweu.png"
    },
    {
      "id": "attackontitan_62477",
      "name": "Grisha Yeager",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b62477-3AHBGul9bXK8.jpg"
    },
    {
      "id": "attackontitan_62479",
      "name": "Marco Bott",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b62479-mYcTkU1RXymL.jpg"
    },
    {
      "id": "attackontitan_62481",
      "name": "Krista Lenz",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b62481-ZZDa7vn17lMU.png"
    },
    {
      "id": "attackontitan_62483",
      "name": "Thomas Wagner",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b62483-zpSlfucUEgwQ.png"
    },
    {
      "id": "attackontitan_62485",
      "name": "Dot Pixis",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b62485-I0U5Cat3z65K.png"
    },
    {
      "id": "attackontitan_62501",
      "name": "Petra Ral",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n62501-CfTtAAgs64nE.jpg"
    },
    {
      "id": "attackontitan_71119",
      "name": "Mike Zacharias",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/71119.jpg"
    },
    {
      "id": "attackontitan_71121",
      "name": "Hange Zoe",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b71121-7R7CnQd3lHgt.png"
    },
    {
      "id": "attackontitan_71123",
      "name": "Nile Dok",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b71123-FswK9rrdbR9h.png"
    },
    {
      "id": "attackontitan_71125",
      "name": "Darius Zackly",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b71125-XXymqijVoYzV.png"
    },
    {
      "id": "attackontitan_71453",
      "name": "Nick",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n71453-IxgKWV5eR1pw.jpg"
    }
  ],
  "haikyuu": [
    {
      "id": "haikyuu_64769",
      "name": "Shouyou Hinata",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b64769-WoWlCMLLgJ14.png"
    },
    {
      "id": "haikyuu_64771",
      "name": "Tobio Kageyama",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b64771-BuCVs7B8bBdh.png"
    },
    {
      "id": "haikyuu_67321",
      "name": "Koushi Sugawara",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b67321-cxP7NdI0JC3H.png"
    },
    {
      "id": "haikyuu_67323",
      "name": "Daichi Sawamura",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b67323-yFbLDAfJ5ysG.png"
    },
    {
      "id": "haikyuu_67325",
      "name": "Ryuunosuke Tanaka",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b67325-yPkbZJkofp5w.jpg"
    },
    {
      "id": "haikyuu_67327",
      "name": "Yuu Nishinoya",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b67327-zQb1dlC7joPb.jpg"
    },
    {
      "id": "haikyuu_67329",
      "name": "Kei Tsukishima",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b67329-k7mDdqQ6rJ4w.png"
    },
    {
      "id": "haikyuu_67331",
      "name": "Chikara Ennoshita",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n67331-skTD3AJ7jrWr.png"
    },
    {
      "id": "haikyuu_67333",
      "name": "Asahi Azumane",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b67333-on5KXeKxZqKs.png"
    },
    {
      "id": "haikyuu_67689",
      "name": "Kiyoko Shimizu",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b67689-QaYw1qDMjwKM.png"
    },
    {
      "id": "haikyuu_70857",
      "name": "Kouji Sekimukai",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b70857-UXTpSRfkS1Xj.png"
    },
    {
      "id": "haikyuu_70859",
      "name": "Yukitaka Izumi",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b70859-IZDZD34pzMms.png"
    },
    {
      "id": "haikyuu_70861",
      "name": "Keishin Ukai",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b70861-mW9IE5G9Ov8J.jpg"
    },
    {
      "id": "haikyuu_71267",
      "name": "Kenma Kozume",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b71267-q44J2MXMinXD.jpg"
    },
    {
      "id": "haikyuu_71269",
      "name": "Tetsurou Kuroo",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b71269-pi9vjyxKPFAu.jpg"
    },
    {
      "id": "haikyuu_71609",
      "name": "Tadashi Yamaguchi",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b71609-5Ht0aqB34eEa.png"
    },
    {
      "id": "haikyuu_71611",
      "name": "Tooru Oikawa",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b71611-cUZwVfzeNXD9.png"
    },
    {
      "id": "haikyuu_73673",
      "name": "Taketora Yamamoto",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n73673-SbfcLzHol5y7.jpg"
    },
    {
      "id": "haikyuu_73675",
      "name": "Sou Inuoka",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n73675-23YnN9WbIVIc.jpg"
    },
    {
      "id": "haikyuu_73677",
      "name": "Yuuki Shibayama",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b73677-Q6cR5bzHez9T.jpg"
    },
    {
      "id": "haikyuu_73679",
      "name": "Ittetsu Takeda",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n73679-OS9fOsMjSJua.png"
    },
    {
      "id": "haikyuu_73681",
      "name": "Yuutarou Kindaichi",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b73681-DBHzToOoEFVb.jpg"
    },
    {
      "id": "haikyuu_74029",
      "name": "Nobuyuki Kai",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n74029-xW8i6uI2NdEY.jpg"
    },
    {
      "id": "haikyuu_74033",
      "name": "Morisuke Yaku",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b74033-pevzERaxK8hB.png"
    }
  ],
  "black-clover": [
    {
      "id": "blackclover_123283",
      "name": "Noelle Silva",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b123283-7nJHtKha0LSm.png"
    },
    {
      "id": "blackclover_123284",
      "name": "Yuno",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b123284-w6kIFYnTclMd.png"
    },
    {
      "id": "blackclover_123285",
      "name": "Asta",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b123285-tKijiuQErDS0.png"
    },
    {
      "id": "blackclover_124433",
      "name": "Finral Roulacase",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124433-QyoZrgIUsSpd.png"
    },
    {
      "id": "blackclover_124434",
      "name": "Charlotte Roselei",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124434-ZmaDj2J5lSId.png"
    },
    {
      "id": "blackclover_124435",
      "name": "Julius Novachrono",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124435-gXFVXWrCcieK.jpg"
    },
    {
      "id": "blackclover_124436",
      "name": "Vanessa Enoteca",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124436-dES6CtprlZNy.png"
    },
    {
      "id": "blackclover_124437",
      "name": "Klaus Lunettes",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124437-3C1plJbD8jSn.png"
    },
    {
      "id": "blackclover_124438",
      "name": "Mimosa Vermillion",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124438-nTvKfJaMD4d5.jpg"
    },
    {
      "id": "blackclover_124439",
      "name": "Magna Swing",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124439-EqjbyC8GOKW0.jpg"
    },
    {
      "id": "blackclover_124440",
      "name": "Yami Sukehiro",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124440-Lpdo6y8cljV6.png"
    },
    {
      "id": "blackclover_124441",
      "name": "William Vangeance",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124441-nggzgZExhb1w.png"
    },
    {
      "id": "blackclover_124442",
      "name": "Nozel Silva",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124442-KpZhHmhjw2EG.png"
    },
    {
      "id": "blackclover_124443",
      "name": "Lily Aquaria",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124443-T2JuU6c7Z9Tk.png"
    },
    {
      "id": "blackclover_124444",
      "name": "Grey",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124444-01PmRKd8Sned.jpg"
    },
    {
      "id": "blackclover_124446",
      "name": "Gauche Adlai",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124446-4YXFoCIllCKh.png"
    },
    {
      "id": "blackclover_124447",
      "name": "Charmy Pappitson",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124447-2J1PKMgWETNT.png"
    },
    {
      "id": "blackclover_124448",
      "name": "Gordon Agrippa",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124448-YHRpWxJUhNnw.png"
    },
    {
      "id": "blackclover_124449",
      "name": "Luck Voltia",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/124449-M67Ex2GcxmYM.jpg"
    },
    {
      "id": "blackclover_124454",
      "name": "Marx Francois",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124454-6iHuVDLPEfrj.png"
    },
    {
      "id": "blackclover_124455",
      "name": "Gueldre Poizot",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124455-cRPjIIy7C6b7.png"
    },
    {
      "id": "blackclover_124456",
      "name": "Jack the Ripper",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124456-llrSWfAXlnbb.png"
    },
    {
      "id": "blackclover_124457",
      "name": "Rill Boismortier",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124457-d3MtJfUT6yqI.png"
    },
    {
      "id": "blackclover_124458",
      "name": "Dorothy Unsworth",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b124458-U6zNf813fDxG.png"
    }
  ],
  "slime": [
    {
      "id": "thattimeigotreincarnatedasaslime_123962",
      "name": "Rimuru Tempest",
      "role": "Karakter Utama",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b123962-eL9yGV0NLMF7.png"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_128033",
      "name": "Shion",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b128033-fLbTgW4M2yj3.png"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_128034",
      "name": "Veldora Tempest",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b128034-Gg5MrpTFNSv8.png"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_128035",
      "name": "Ranga",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b128035-7r8BX1tt8BKg.png"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_128036",
      "name": "Milim Nava",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b128036-lW0dxNwerqw4.png"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_128037",
      "name": "Shizu",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b128037-kJ3HzX4s4iDl.png"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_128038",
      "name": "Benimaru",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b128038-VgVcqf6NDGJ5.png"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_128039",
      "name": "Souei",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b128039-cce4njbCcb2M.png"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_128040",
      "name": "Shuna",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b128040-QOhtFHgfOT5O.png"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_129347",
      "name": "Daikenja",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b129347-m1xftx27rHwl.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_129348",
      "name": "Rigurd",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b129348-uWQXM503laJT.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_129349",
      "name": "Rigur",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b129349-lneC6Glj2bps.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_129350",
      "name": "Gobta",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b129350-qF2RlaSXb8Ro.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_129914",
      "name": "Myrd",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n129914-30U7I3xGmL3q.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_129915",
      "name": "Kaijin",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b129915-09RUrdTUgymf.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_129916",
      "name": "Gido",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b129916-f5ZWUvmNY41G.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_129917",
      "name": "Dord",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n129917-3UC194PSkLFQ.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_129918",
      "name": "Kaval",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b129918-Srq5hldfOKBm.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_129919",
      "name": "Ellen",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b129919-EpaC3tWzCDpF.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_129923",
      "name": "Garm",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b129923-h8OLZNRSz6oe.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_131033",
      "name": "Diablo",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b131033-0LguIALHCBEH.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_131034",
      "name": "Ramiris",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n131034-Xb6oPnWAbpZq.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_131041",
      "name": "Gabiru",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b131041-MKPEBzVY1XPh.jpg"
    },
    {
      "id": "thattimeigotreincarnatedasaslime_131043",
      "name": "Hakurou",
      "role": "Karakter Pendukung",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b131043-AyEdKg1Xkjrd.png"
    }
  ],
  "tokoh-indonesia": [
    {
      "id": "ti_1",
      "name": "Ir. Soekarno",
      "role": "Presiden RI 1 & Proklamator",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Presiden_Sukarno.jpg/330px-Presiden_Sukarno.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_2",
      "name": "Mohammad Hatta",
      "role": "Wapres RI 1 & Proklamator",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/Drs._Mohammad_Hatta%2C_10_Orang_Indonesia_Terbesar_Sekarang_%281952%29%2C_p30.jpg/330px-Drs._Mohammad_Hatta%2C_10_Orang_Indonesia_Terbesar_Sekarang_%281952%29%2C_p30.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_3",
      "name": "B.J. Habibie",
      "role": "Presiden RI 3 & Teknokrat",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/B._J._Habibie%2C_President_of_Indonesia_portrait.jpg/330px-B._J._Habibie%2C_President_of_Indonesia_portrait.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_4",
      "name": "R.A. Kartini",
      "role": "Pahlawan Emansipasi Wanita",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/COLLECTIE_TROPENMUSEUM_Portret_van_Raden_Ajeng_Kartini_TMnr_10018776.jpg/330px-COLLECTIE_TROPENMUSEUM_Portret_van_Raden_Ajeng_Kartini_TMnr_10018776.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_5",
      "name": "Ki Hajar Dewantara",
      "role": "Bapak Pendidikan Nasional",
      "image": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Ki_Hadjar_Dewantara_Mimbar_Umum_18_October_1949_p2.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ti_6",
      "name": "Jenderal Soedirman",
      "role": "Panglima Besar TNI",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Sudirman.jpg/330px-Sudirman.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_7",
      "name": "Gus Dur",
      "role": "Presiden RI 4 & Guru Bangsa",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/President_Abdurrahman_Wahid_-_Indonesia.jpg/330px-President_Abdurrahman_Wahid_-_Indonesia.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_8",
      "name": "Raden Saleh",
      "role": "Pelukis Romantisisme Klasik",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Portrait_of_Raden_Saleh_c._1872.jpg/330px-Portrait_of_Raden_Saleh_c._1872.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_9",
      "name": "Cut Nyak Dien",
      "role": "Pahlawan Nasional Aceh",
      "image": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Cut_Nyak_Dien.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ti_10",
      "name": "Bung Tomo",
      "role": "Pahlawan Pertempuran 10 November",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Bung_Tomo.jpg/330px-Bung_Tomo.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_11",
      "name": "Iwan Fals",
      "role": "Musisi Balada Legendaris",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Iwan_Fals%2C_2015_%28cropped%29.jpg/330px-Iwan_Fals%2C_2015_%28cropped%29.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_12",
      "name": "Chrisye",
      "role": "Legenda Musik Pop Indonesia",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Chrisye_2020_stamp_of_Indonesia.jpg/330px-Chrisye_2020_stamp_of_Indonesia.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_13",
      "name": "Benyamin Sueb",
      "role": "Seniman & Komedian Betawi",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Benjamin_S_Majalah_Aktuil_Edisi_71_Tahun_1971.jpg/330px-Benjamin_S_Majalah_Aktuil_Edisi_71_Tahun_1971.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_14",
      "name": "Najwa Shihab",
      "role": "Jurnalis & Tuan Rumah Narasi",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Najwa_Shihab_2022_%28cropped%29.jpg/330px-Najwa_Shihab_2022_%28cropped%29.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_15",
      "name": "Taufik Hidayat",
      "role": "Legenda Bulu Tangkis Olimpiade",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Taufik_Hidayat%2C_Wakil_Menteri_Pemuda_dan_Olahraga_%282025%29.png/330px-Taufik_Hidayat%2C_Wakil_Menteri_Pemuda_dan_Olahraga_%282025%29.png?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_16",
      "name": "Susi Susanti",
      "role": "Peraih Medali Emas Olimpiade 1992",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Susi_Susanti.jpg/330px-Susi_Susanti.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_17",
      "name": "Raffi Ahmad",
      "role": "Presenter & Tokoh Publik",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Raffi-Ahmad-2020_%28cropped%29.jpg/330px-Raffi-Ahmad-2020_%28cropped%29.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_18",
      "name": "Reza Rahadian",
      "role": "Aktor Film Terkemuka",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Reza_Rahadian_Actor_of_the_Year_ICA_2017.jpg/330px-Reza_Rahadian_Actor_of_the_Year_ICA_2017.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_19",
      "name": "Dian Sastrowardoyo",
      "role": "Aktris Film & Sutradara",
      "image": "https://upload.wikimedia.org/wikipedia/commons/3/33/Dian_Sastrowardoyo_%282016%29.png?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ti_20",
      "name": "Joe Taslim",
      "role": "Aktor Laga Internasional",
      "image": "https://ui-avatars.com/api/?name=Joe%20Taslim&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ti_21",
      "name": "Iko Uwais",
      "role": "Koreografer & Aktor Laga",
      "image": "https://ui-avatars.com/api/?name=Iko%20Uwais&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ti_22",
      "name": "Agnez Mo",
      "role": "Penyanyi & Artis Global",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Agnez_Mo_2019_by_Glenn_Francis.jpg/330px-Agnez_Mo_2019_by_Glenn_Francis.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ti_23",
      "name": "W.S. Rendra",
      "role": "Penyair Si Burung Merak",
      "image": "https://ui-avatars.com/api/?name=W.S.%20Rendra&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ti_24",
      "name": "Titiek Puspa",
      "role": "Penyanyi & Komponis Senior",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Titiek_Puspa_Varia_cover.jpg/330px-Titiek_Puspa_Varia_cover.jpg?utm_source=id.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    }
  ],
  "tokoh-dunia": [
    {
      "id": "td_1",
      "name": "Albert Einstein",
      "role": "Fisikawan Teori Relativitas",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/Albert_Einstein_Head_cleaned.jpg/330px-Albert_Einstein_Head_cleaned.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_2",
      "name": "Leonardo da Vinci",
      "role": "Polimatik & Pelukis Mona Lisa",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Francesco_Melzi_-_Portrait_of_Leonardo_%28colour_correction%29.png/330px-Francesco_Melzi_-_Portrait_of_Leonardo_%28colour_correction%29.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_3",
      "name": "Isaac Newton",
      "role": "Bapak Gravitasi & Fisika Klasik",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg/330px-Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_4",
      "name": "Marie Curie",
      "role": "Pionir Radioaktivitas Nobelis",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/330px-Marie_Curie_c._1920s.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_5",
      "name": "Nikola Tesla",
      "role": "Penemu Listrik Arus Bolak-Balik",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/Tesla_circa_1890.jpeg/330px-Tesla_circa_1890.jpeg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_6",
      "name": "Steve Jobs",
      "role": "Pendiri Apple Inc. & Visioner",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Steve_Jobs_Headshot_2010_%28cropped_4%29.jpg/330px-Steve_Jobs_Headshot_2010_%28cropped_4%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_7",
      "name": "Elon Musk",
      "role": "Pendiri Tesla & SpaceX",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Elon_Musk_-_54820081119_%283x4_cropped%2C_Rule_of_thirds%29.jpg/330px-Elon_Musk_-_54820081119_%283x4_cropped%2C_Rule_of_thirds%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_8",
      "name": "Bill Gates",
      "role": "Pendiri Microsoft & Filantropis",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Bill_Gates_at_the_European_Commission_-_P067383-987995_%28cropped%29_5.jpg/330px-Bill_Gates_at_the_European_Commission_-_P067383-987995_%28cropped%29_5.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_9",
      "name": "Stephen Hawking",
      "role": "Fisikawan Teori Lubang Hitam",
      "image": "https://ui-avatars.com/api/?name=Stephen%20Hawking&background=0284c7&color=fff&size=200"
    },
    {
      "id": "td_10",
      "name": "Charles Darwin",
      "role": "Pencetus Teori Evolusi",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Charles_Darwin_seated_crop.jpg/330px-Charles_Darwin_seated_crop.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_11",
      "name": "William Shakespeare",
      "role": "Pujangga Teater Klasik",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/William_Shakespeare_by_John_Taylor%2C_edited.jpg/330px-William_Shakespeare_by_John_Taylor%2C_edited.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_12",
      "name": "Ludwig van Beethoven",
      "role": "Komponis Musik Klasik",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Joseph_Karl_Stieler%27s_Beethoven_mit_dem_Manuskript_der_Missa_solemnis.jpg/330px-Joseph_Karl_Stieler%27s_Beethoven_mit_dem_Manuskript_der_Missa_solemnis.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_13",
      "name": "Cristiano Ronaldo",
      "role": "Megabintang Sepak Bola",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_%28cropped%29.jpg/330px-Cristiano_Ronaldo_Croatia_v_Portugal_2_July_2026-075_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_14",
      "name": "Lionel Messi",
      "role": "Kapten Juara Dunia Argentina",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg/330px-Leo_Messi_Argentina_v_Egypt_7_July_2026-1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_15",
      "name": "Michael Jordan",
      "role": "Legenda Basket Terhebat NBA",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Michael_jordan_admad_rashad_%2851276390562%29_%28cropped%29.jpg/330px-Michael_jordan_admad_rashad_%2851276390562%29_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_16",
      "name": "Muhammad Ali",
      "role": "Juara Tinju Dunia The Greatest",
      "image": "https://ui-avatars.com/api/?name=Muhammad%20Ali&background=0284c7&color=fff&size=200"
    },
    {
      "id": "td_17",
      "name": "Taylor Swift",
      "role": "Penyanyi & Ikon Pop Global",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png/330px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_18",
      "name": "Freddie Mercury",
      "role": "Vokalis Karismatik Queen",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Freddie_Mercury_performing_in_New_Haven%2C_CT%2C_November_1977.jpg/330px-Freddie_Mercury_performing_in_New_Haven%2C_CT%2C_November_1977.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_19",
      "name": "Michael Jackson",
      "role": "King of Pop Dunia",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Michael_Jackson_1983_%283x4_cropped%29_%28contrast%29.jpg/330px-Michael_Jackson_1983_%283x4_cropped%29_%28contrast%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_20",
      "name": "Nelson Mandela",
      "role": "Tokoh Perdamaian Dunia",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Nelson_Mandela_1994.jpg/330px-Nelson_Mandela_1994.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_21",
      "name": "Mahatma Gandhi",
      "role": "Pemimpin Gerakan Nir-Kekerasan",
      "image": "https://ui-avatars.com/api/?name=Mahatma%20Gandhi&background=0284c7&color=fff&size=200"
    },
    {
      "id": "td_22",
      "name": "Barack Obama",
      "role": "Presiden AS ke-44",
      "image": "https://ui-avatars.com/api/?name=Barack%20Obama&background=0284c7&color=fff&size=200"
    },
    {
      "id": "td_23",
      "name": "Vincent van Gogh",
      "role": "Pelukis The Starry Night",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/330px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "td_24",
      "name": "Wolfgang Amadeus Mozart",
      "role": "Komponis Jenius Klasik",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/The_Mozart_Family_-_Wolfgang_Amadeus_Mozart_headshot.jpg/330px-The_Mozart_Family_-_Wolfgang_Amadeus_Mozart_headshot.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    }
  ],
  "superhero": [
    {
      "id": "sh_1",
      "name": "Iron Man (Tony Stark)",
      "role": "Genius Billionaire Avenger",
      "image": "https://upload.wikimedia.org/wikipedia/en/4/47/Iron_Man_%28circa_2018%29.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_2",
      "name": "Spider-Man (Peter Parker)",
      "role": "Friendly Neighborhood Hero",
      "image": "https://ui-avatars.com/api/?name=Spider-Man%20(Peter%20Parker)&background=8b5cf6&color=fff&size=200"
    },
    {
      "id": "sh_3",
      "name": "Captain America (Steve Rogers)",
      "role": "First Avenger",
      "image": "https://ui-avatars.com/api/?name=Captain%20America%20(Steve%20Rogers)&background=8b5cf6&color=fff&size=200"
    },
    {
      "id": "sh_4",
      "name": "Thor Odinson",
      "role": "God of Thunder",
      "image": "https://upload.wikimedia.org/wikipedia/en/1/1a/Thor_%28Marvel_Comics%29.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_5",
      "name": "The Hulk (Bruce Banner)",
      "role": "Green Behemoth",
      "image": "https://upload.wikimedia.org/wikipedia/en/a/aa/Hulk_%28circa_2019%29.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_6",
      "name": "Black Widow (Natasha)",
      "role": "Master Assassin",
      "image": "https://upload.wikimedia.org/wikipedia/en/3/37/Natasha_Romanova_incarnations.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_7",
      "name": "Doctor Strange",
      "role": "Sorcerer Supreme",
      "image": "https://upload.wikimedia.org/wikipedia/en/4/4f/Doctor_Strange_Vol_4_2_Ross_Variant_Textless.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_8",
      "name": "Black Panther (T'Challa)",
      "role": "King of Wakanda",
      "image": "https://ui-avatars.com/api/?name=Black%20Panther%20(T'Challa)&background=8b5cf6&color=fff&size=200"
    },
    {
      "id": "sh_9",
      "name": "Scarlet Witch (Wanda)",
      "role": "Chaos Magic Mutant",
      "image": "https://upload.wikimedia.org/wikipedia/en/e/ec/Scarlet_Witch_Various_incarnations_2021.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_10",
      "name": "Wolverine (Logan)",
      "role": "Adamantium Mutant",
      "image": "https://ui-avatars.com/api/?name=Wolverine%20(Logan)&background=8b5cf6&color=fff&size=200"
    },
    {
      "id": "sh_11",
      "name": "Deadpool (Wade Wilson)",
      "role": "Merc with a Mouth",
      "image": "https://upload.wikimedia.org/wikipedia/en/c/ca/Deadpool.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_12",
      "name": "Batman (Bruce Wayne)",
      "role": "The Dark Knight of Gotham",
      "image": "https://upload.wikimedia.org/wikipedia/en/c/c7/Batman_Infobox.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_13",
      "name": "Superman (Clark Kent)",
      "role": "Man of Steel",
      "image": "https://upload.wikimedia.org/wikipedia/en/3/35/Supermanflying.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_14",
      "name": "Wonder Woman (Diana Prince)",
      "role": "Amazonian Princess",
      "image": "https://upload.wikimedia.org/wikipedia/en/6/6b/Wonder_Woman_750.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_15",
      "name": "The Flash (Barry Allen)",
      "role": "Fastest Man Alive",
      "image": "https://ui-avatars.com/api/?name=The%20Flash%20(Barry%20Allen)&background=8b5cf6&color=fff&size=200"
    },
    {
      "id": "sh_16",
      "name": "Aquaman (Arthur Curry)",
      "role": "King of the Seven Seas",
      "image": "https://upload.wikimedia.org/wikipedia/en/9/9d/Aquaman_Rebirth_1.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_17",
      "name": "Joker",
      "role": "Clown Prince of Crime",
      "image": "https://upload.wikimedia.org/wikipedia/en/5/5f/Batman_Three_Jokers.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_18",
      "name": "Harley Quinn",
      "role": "Maid of Mischief",
      "image": "https://upload.wikimedia.org/wikipedia/en/c/c9/HarleyQuinn_Various_incarnations.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_19",
      "name": "Green Lantern (Hal Jordan)",
      "role": "Emerald Knight",
      "image": "https://upload.wikimedia.org/wikipedia/en/9/90/Green_Lantern_%28Hal_Jordan%29.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_20",
      "name": "Cyborg (Victor Stone)",
      "role": "Technopathic Titan",
      "image": "https://upload.wikimedia.org/wikipedia/en/5/58/Cyborg_%28Victor_Stone%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_21",
      "name": "Robin (Dick Grayson)",
      "role": "Boy Wonder",
      "image": "https://upload.wikimedia.org/wikipedia/en/2/20/Robins_%28DC_Comics_characters%29.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_22",
      "name": "Catwoman (Selina Kyle)",
      "role": "Feline Burglar",
      "image": "https://upload.wikimedia.org/wikipedia/en/e/e4/Catwoman_Infobox.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "sh_23",
      "name": "Shazam (Billy Batson)",
      "role": "Champion of Magic",
      "image": "https://ui-avatars.com/api/?name=Shazam%20(Billy%20Batson)&background=8b5cf6&color=fff&size=200"
    },
    {
      "id": "sh_24",
      "name": "Hawkeye (Clint Barton)",
      "role": "Master Archer",
      "image": "https://upload.wikimedia.org/wikipedia/en/1/1b/Hawkeye_%28circa_2022%29.webp?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    }
  ],
  "movie-series": [
    {
      "id": "ms_1",
      "name": "Harry Potter",
      "role": "The Boy Who Lived",
      "image": "https://upload.wikimedia.org/wikipedia/commons/9/99/Daniel_Radcliffe_as_Harry_Potter.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ms_2",
      "name": "Hermione Granger",
      "role": "Brightest Witch of Her Age",
      "image": "https://upload.wikimedia.org/wikipedia/en/d/d3/Hermione_Granger_poster.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ms_3",
      "name": "Ron Weasley",
      "role": "Brave Gryffindor Knight",
      "image": "https://upload.wikimedia.org/wikipedia/en/5/5e/Ron_Weasley_poster.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ms_4",
      "name": "Albus Dumbledore",
      "role": "Hogwarts Headmaster",
      "image": "https://upload.wikimedia.org/wikipedia/en/e/e8/Dumbledore_-_Prisoner_of_Azkaban.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ms_5",
      "name": "Severus Snape",
      "role": "Potions Master & Half-Blood Prince",
      "image": "https://upload.wikimedia.org/wikipedia/en/b/b9/Ootp076.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ms_6",
      "name": "Lord Voldemort",
      "role": "The Dark Lord",
      "image": "https://ui-avatars.com/api/?name=Lord%20Voldemort&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_7",
      "name": "Captain Jack Sparrow",
      "role": "Pirate Captain of the Black Pearl",
      "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Johnny_Depp_as_Captain_Jack_Sparrow_in_Queensland%2C_Australia.jpg/330px-Johnny_Depp_as_Captain_Jack_Sparrow_in_Queensland%2C_Australia.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ms_8",
      "name": "Sherlock Holmes",
      "role": "Consulting Detective of 221B",
      "image": "https://ui-avatars.com/api/?name=Sherlock%20Holmes&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_9",
      "name": "Dr. John Watson",
      "role": "Doctor & War Veteran",
      "image": "https://ui-avatars.com/api/?name=Dr.%20John%20Watson&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_10",
      "name": "Wednesday Addams",
      "role": "Nevermore Academy Outcast",
      "image": "https://upload.wikimedia.org/wikipedia/commons/6/61/Wednesday_Addams_1964.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ms_11",
      "name": "Walter White",
      "role": "Heisenberg",
      "image": "https://upload.wikimedia.org/wikipedia/en/0/03/Walter_White_S5B.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ms_12",
      "name": "Jesse Pinkman",
      "role": "Partner in Albuquerque",
      "image": "https://ui-avatars.com/api/?name=Jesse%20Pinkman&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_13",
      "name": "Neo (Thomas Anderson)",
      "role": "The One of the Matrix",
      "image": "https://ui-avatars.com/api/?name=Neo%20(Thomas%20Anderson)&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_14",
      "name": "Morpheus",
      "role": "Zion Resistance Captain",
      "image": "https://ui-avatars.com/api/?name=Morpheus&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_15",
      "name": "Katniss Everdeen",
      "role": "The Mockingjay",
      "image": "https://ui-avatars.com/api/?name=Katniss%20Everdeen&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_16",
      "name": "Peeta Mellark",
      "role": "Baker's Son & Tribute",
      "image": "https://ui-avatars.com/api/?name=Peeta%20Mellark&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_17",
      "name": "Gandalf the Grey",
      "role": "Wizard of Middle-earth",
      "image": "https://ui-avatars.com/api/?name=Gandalf%20the%20Grey&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_18",
      "name": "Frodo Baggins",
      "role": "Ring-bearer of the Shire",
      "image": "https://ui-avatars.com/api/?name=Frodo%20Baggins&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_19",
      "name": "Legolas Greenleaf",
      "role": "Elven Prince & Master Archer",
      "image": "https://ui-avatars.com/api/?name=Legolas%20Greenleaf&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_20",
      "name": "Jon Snow",
      "role": "King in the North & Lord Commander",
      "image": "https://ui-avatars.com/api/?name=Jon%20Snow&background=0284c7&color=fff&size=200"
    },
    {
      "id": "ms_21",
      "name": "Daenerys Targaryen",
      "role": "Mother of Dragons",
      "image": "https://thumb.wikimedia.org/wikipedia/en/thumb/0/0d/Daenerys_Targaryen_with_Dragon-Emilia_Clarke.jpg/330px-Daenerys_Targaryen_with_Dragon-Emilia_Clarke.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
    },
    {
      "id": "ms_22",
      "name": "Darth Vader",
      "role": "Sith Lord & Supreme Commander",
      "image": "https://upload.wikimedia.org/wikipedia/en/0/0b/Darth_Vader_in_The_Empire_Strikes_Back.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ms_23",
      "name": "Luke Skywalker",
      "role": "Jedi Knight & Hero of the Rebellion",
      "image": "https://upload.wikimedia.org/wikipedia/commons/6/67/Luke_Skywalker_-_Welcome_Banner_%28Cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled"
    },
    {
      "id": "ms_24",
      "name": "Indiana Jones",
      "role": "Adventuring Archaeologist",
      "image": "https://ui-avatars.com/api/?name=Indiana%20Jones&background=0284c7&color=fff&size=200"
    }
  ]
},

    // Jikan Anime MAL IDs
    ANIME_MAP: {
      'naruto': 20,
      'one-piece': 21,
      'haikyuu': 20583,
      'black-clover': 34572,
      'jujutsu-kaisen': 40748,
      'slime': 37430,
      'aot': 16498
    },

    /**
     * Fetches characters dynamically from Jikan API v4 or Wikipedia REST API,
     * with automatic and instant fallback to curated decks on network timeout/limits.
     */
    async getCharacters({ category = 'anime', subTheme = 'all-popular', targetCount = 24 } = {}) {
      UI.Logger('GUESS-WHO', `Fetching characters for [${category} / ${subTheme}], count: ${targetCount}`);

      // 1. Try Jikan API if specific anime subtheme
      if (category === 'anime' && this.ANIME_MAP[subTheme]) {
        const malId = this.ANIME_MAP[subTheme];
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}/characters`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.data) && data.data.length >= 12) {
              const fetched = data.data.slice(0, targetCount).map((entry, idx) => {
                const char = entry.character;
                const rawName = char.name || 'Karakter';
                // Flip "Last, First" to "First Last"
                const parts = rawName.split(',').map(s => s.trim());
                const cleanName = parts.length > 1 ? `${parts[1]} ${parts[0]}` : parts[0];

                return {
                  id: `jikan_${char.mal_id || idx}`,
                  name: cleanName,
                  role: entry.role || 'Karakter Anime',
                  image: char.images?.webp?.image_url || char.images?.jpg?.image_url || ''
                };
              });

              if (fetched.length >= targetCount) {
                UI.Logger('GUESS-WHO', `Successfully fetched ${fetched.length} characters from Jikan API v4`);
                return fetched.slice(0, targetCount);
              }
            }
          }
        } catch (apiErr) {
          UI.Logger('GUESS-WHO', 'Jikan API fetch skipped or timed out, using curated deck', apiErr.message);
        }
      }

      // 2. Curated Selection (100% Authentic Official Characters & Portraits)
      let baseDeck = this.DECKS[subTheme] || this.DECKS[category] || this.DECKS['all-popular'];
      if (!baseDeck || baseDeck.length === 0) {
        baseDeck = this.DECKS['all-popular'];
      }

      let pool = [...baseDeck];

      // If requested targetCount > deck size (e.g. 36 or 48 for 3+ players)
      if (pool.length < targetCount) {
        const supplementDeck = category === 'anime'
          ? this.DECKS['all-popular']
          : this.DECKS['tokoh-dunia'];

        if (supplementDeck) {
          supplementDeck.forEach(c => {
            if (pool.length < targetCount && !pool.some(p => p.name === c.name)) {
              pool.push(c);
            }
          });
        }

        // If still under targetCount, supplement with other available decks without duplicates
        if (pool.length < targetCount) {
          for (const key of Object.keys(this.DECKS)) {
            if (key === subTheme) continue;
            const extra = this.DECKS[key] || [];
            for (const c of extra) {
              if (pool.length >= targetCount) break;
              if (!pool.some(p => p.name === c.name)) {
                pool.push(c);
              }
            }
            if (pool.length >= targetCount) break;
          }
        }
      }

      // Shuffle deck
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, targetCount);
    }
  };

  // ==========================================================================
  // 2. GUESS WHO GAME STATE & ORCHESTRATOR
  // ==========================================================================
  let currentRoom = null;
  let currentPlayer = null;
  let activeTargetPlayerId = null; // Target player tab currently selected for elimination notes
  let localSearchQuery = '';
  let showSecretCardModal = false;

  const THEME_OPTIONS = [
    {
      category: 'anime',
      categoryLabel: 'Anime Populer (Jikan API)',
      subThemes: [
        { key: 'all-popular', label: 'Mix Semua Anime Populer' },
        { key: 'naruto', label: 'Naruto Shippuden (ID: 20)' },
        { key: 'one-piece', label: 'One Piece (ID: 21)' },
        { key: 'jujutsu-kaisen', label: 'Jujutsu Kaisen (ID: 40748)' },
        { key: 'aot', label: 'Attack on Titan (ID: 16498)' },
        { key: 'haikyuu', label: 'Haikyuu!! (ID: 20583)' },
        { key: 'black-clover', label: 'Black Clover (ID: 34572)' },
        { key: 'slime', label: 'Tensura / Slime (ID: 37430)' }
      ]
    },
    {
      category: 'pop-culture',
      categoryLabel: 'Tokoh & Pop Culture Dunia',
      subThemes: [
        { key: 'tokoh-indonesia', label: 'Tokoh Terkenal Indonesia' },
        { key: 'tokoh-dunia', label: 'Tokoh Terkenal Dunia' },
        { key: 'superhero', label: 'Marvel & DC Universe' },
        { key: 'movie-series', label: 'Movie & Series Populer' }
      ]
    }
  ];

  function getGameState(roomData) {
    if (!roomData) return {};
    const state = roomData.guessWhoGame || roomData.gameState?.guessWho || {};
    if (!state.playerSecrets || typeof state.playerSecrets !== 'object') state.playerSecrets = {};
    if (!state.playerStats || typeof state.playerStats !== 'object') state.playerStats = {};
    if (!Array.isArray(state.boardCharacters)) state.boardCharacters = [];
    return state;
  }

  function getEliminatedNotes(roomCode, myId, targetId) {
    try {
      const key = `gw_notes_${roomCode}_${myId}_${targetId}`;
      const saved = localStorage.getItem(key);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  }

  function saveEliminatedNotes(roomCode, myId, targetId, noteSet) {
    try {
      const key = `gw_notes_${roomCode}_${myId}_${targetId}`;
      localStorage.setItem(key, JSON.stringify(Array.from(noteSet)));
    } catch (e) {}
  }

  return {
    CharacterService,

    init(roomData, player) {
      currentRoom = roomData;
      currentPlayer = player;
      UI.setTheme('guess-who');
      UI.Logger('GUESS-WHO', 'Initialized Guess Who Module');
    },

    onStateChange(roomData) {
      currentRoom = roomData;
      const state = getGameState(roomData);
      UI.Logger('GUESS-WHO', 'State updated', { status: state.status, round: state.round });
    },

    render(containerEl, roomData, player) {
      currentRoom = roomData;
      currentPlayer = player;
      UI.setTheme('guess-who');

      const gameState = getGameState(roomData);
      const status = gameState.status || 'config';

      if (status === 'config') {
        this.renderConfigPhase(containerEl, roomData, player, gameState);
      } else {
        this.renderBattleRoyalePhase(containerEl, roomData, player, gameState);
      }

      UI.refreshIcons();
    },

    /**
     * ==========================================================================
     * PANEL KONFIGURASI HOST (SEBELUM MULAI)
     * ==========================================================================
     */
    renderConfigPhase(containerEl, roomData, player, gameState) {
      const isHost = Boolean(player.isHost);
      const playerList = Object.values(roomData.players || {});
      const totalPlayers = playerList.length;

      // Default count: 2 players = 24, 3+ players = 48
      const defaultCardCount = totalPlayers <= 2 ? 24 : 48;
      const currentCount = gameState.cardCount || defaultCardCount;
      const currentCategory = gameState.themeKey || 'anime';
      const currentSubTheme = gameState.subThemeKey || 'all-popular';

      const headerHTML = `
        <div class="flex items-center justify-between mb-6">
          <button 
            onclick="App.returnToLobby()"
            class="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-900/10 font-display font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Kembali ke Lobby</span>
          </button>
          <div class="flex items-center gap-2 bg-white/90 px-4 py-1.5 rounded-2xl border-2 border-sky-500/20 text-xs font-display font-bold text-sky-900 shadow-sm">
            <span>ROOM:</span>
            <span class="text-sky-700 font-extrabold tracking-widest">${roomData.code}</span>
          </div>
        </div>
      `;

      if (!isHost) {
        // Non-Host Waiting View
        const waitingContent = `
          <div class="max-w-md mx-auto text-center py-10">
            <div class="w-20 h-20 mx-auto mb-4 rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center border-2 border-sky-300 shadow-joyful animate-float">
              <i data-lucide="user-search" class="w-10 h-10"></i>
            </div>
            <h3 class="font-display font-bold text-2xl text-slate-800">Menunggu Host...</h3>
            <p class="font-body text-xs sm:text-sm text-slate-500 mt-2">
              Host sedang mengatur tema karakter dan jumlah wajah untuk pertandingan Battle Royale.
            </p>
            <div class="mt-6 p-4 rounded-2xl bg-white border-2 border-sky-500/15 shadow-sm inline-flex items-center gap-3">
              <span class="w-3 h-3 rounded-full bg-sky-500 animate-ping"></span>
              <span class="text-xs font-display font-bold text-sky-900">
                Tema: ${currentCategory.toUpperCase()} • ${currentCount} Wajah
              </span>
            </div>
          </div>
        `;

        containerEl.innerHTML = headerHTML + waitingContent;
        return;
      }

      // Host Configuration Panel
      const countOptions = [24, 36, 48];
      const countButtonsHTML = countOptions.map(c => `
        <button 
          onclick="GuessWhoGame.setHostConfig({ cardCount: ${c} })"
          class="flex-1 py-3 rounded-2xl font-display font-bold text-sm border-2 transition-all cursor-pointer ${
            currentCount === c 
              ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-4 ring-sky-500/20 scale-102' 
              : 'bg-white text-slate-700 border-slate-900/10 hover:border-sky-300'
          }"
        >
          ${c} Wajah ${c === defaultCardCount ? '⚡ (Otomatis)' : ''}
        </button>
      `).join('');

      // Sub-Theme Select options
      const themeTabsHTML = THEME_OPTIONS.map(opt => `
        <div class="mb-4">
          <label class="block font-display font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
            ${opt.categoryLabel}
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${opt.subThemes.map(sub => `
              <button 
                onclick="GuessWhoGame.setHostConfig({ themeKey: '${opt.category}', subThemeKey: '${sub.key}' })"
                class="p-3 rounded-2xl text-left font-display font-bold text-xs sm:text-sm border-2 transition-all cursor-pointer flex items-center justify-between ${
                  currentSubTheme === sub.key
                    ? 'bg-sky-50 border-sky-600 text-sky-950 ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-900/10 text-slate-700 hover:border-slate-300'
                }"
              >
                <span>${sub.label}</span>
                ${currentSubTheme === sub.key ? '<i data-lucide="check" class="w-4 h-4 text-sky-600"></i>' : ''}
              </button>
            `).join('')}
          </div>
        </div>
      `).join('');

      const panelContent = `
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-6">
            <h2 class="font-display font-black text-2xl sm:text-3xl text-slate-900">
              Pengaturan Guess Who? Battle Royale 🕵️
            </h2>
            <p class="font-body text-xs sm:text-sm text-slate-500 mt-1">
              Pilih jumlah wajah di papan dan tema kartu sebelum memulai permainan voice chat.
            </p>
          </div>

          <div class="bg-white rounded-3xl border-2 border-slate-900/10 p-6 sm:p-8 shadow-joyful mb-6">
            <!-- 1. Opsi Jumlah Wajah -->
            <div class="mb-6">
              <label class="block font-display font-bold text-xs uppercase tracking-wider text-slate-500 mb-2.5">
                Jumlah Wajah di Papan
              </label>
              <div class="flex gap-2.5">
                ${countButtonsHTML}
              </div>
              <p class="text-[11px] font-body text-slate-400 mt-2">
                💡 Rekomendasi: 2 pemain = 24 wajah. 3+ pemain = 48 wajah untuk eliminasi lebih menantang!
              </p>
            </div>

            <!-- 2. Pemilih Tema -->
            <div class="mb-8 border-t border-slate-100 pt-5">
              ${themeTabsHTML}
            </div>

            <!-- 3. Tombol Start -->
            <button 
              id="btn-start-guess-who"
              onclick="GuessWhoGame.startGame()"
              class="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-display font-black text-base shadow-lg shadow-sky-600/30 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <i data-lucide="play" class="w-5 h-5"></i>
              <span>Mulai Pertandingan Battle Royale 🚀</span>
            </button>
          </div>
        </div>
      `;

      containerEl.innerHTML = headerHTML + panelContent;
    },

    /**
     * Update configuration in Firebase by Host
     */
    async setHostConfig(partialConfig) {
      if (!currentRoom || !currentPlayer?.isHost) return;
      UI.Sound.click();
      await DB.updateGameState(currentRoom.code, 'guessWho', partialConfig);
    },

    /**
     * Start the Battle Royale Game
     */
    async startGame() {
      if (!currentRoom || !currentPlayer?.isHost) return;

      const btn = document.getElementById('btn-start-guess-who');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin mr-2">⏳</span> Memuat Kartu Karakter...`;
      }

      try {
        UI.Sound.pop();
        UI.Logger('GUESS-WHO', 'Starting game, fetching characters...');

        const gameState = getGameState(currentRoom);
        const playerList = Object.values(currentRoom.players || {});
        const count = gameState.cardCount || (playerList.length <= 2 ? 24 : 48);

        // Fetch characters using CharacterService
        const boardCards = await CharacterService.getCharacters({
          category: gameState.themeKey || 'anime',
          subTheme: gameState.subThemeKey || 'all-popular',
          targetCount: count
        });

        // Randomly assign 1 secret character per player (without duplicates if possible)
        const shuffledCards = [...boardCards].sort(() => 0.5 - Math.random());
        const playerSecrets = {};
        const playerStats = {};

        playerList.forEach((p, index) => {
          const assignedCard = shuffledCards[index % shuffledCards.length];
          playerSecrets[p.id] = assignedCard.id;
          playerStats[p.id] = {
            isAlive: true,
            points: 0,
            eliminatedBy: null
          };
        });

        await DB.updateGameState(currentRoom.code, 'guessWho', {
          boardCharacters: boardCards,
          playerSecrets,
          playerStats,
          status: 'playing',
          winnerId: null,
          round: (gameState.round || 1),
          lastEvent: {
            type: 'START',
            timestamp: Date.now()
          }
        });

        UI.Sound.fanfare();
        UI.Confetti();
        UI.Toast('Pertandingan Dimulai! Cek Karakter Rahasiamu.', 'success', 4000);
      } catch (err) {
        UI.Logger('GUESS-WHO', 'Error starting game:', err, true);
        UI.Toast('Gagal memulai Guess Who: ' + (err.message || err), 'error');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>Mulai Pertandingan Battle Royale! 🚀</span>`;
        }
      }
    },

    /**
     * ==========================================================================
     * FASE BATTLE ROYALE GAMEPLAY (PAPAN WAJAH & SISTEM GUGUR)
     * ==========================================================================
     */
    renderBattleRoyalePhase(containerEl, roomData, player, gameState) {
      const playerList = Object.values(roomData.players || {});
      const isHost = Boolean(player.isHost);
      const isGameOver = gameState.status === 'gameover' || Boolean(gameState.winnerId);

      const board = gameState.boardCharacters || [];
      const secrets = gameState.playerSecrets || {};
      const stats = gameState.playerStats || {};

      const myStat = stats[player.id] || { isAlive: true, points: 0 };
      const myIsAlive = Boolean(myStat.isAlive);
      const mySecretId = secrets[player.id];
      const mySecretCard = board.find(c => c.id === mySecretId) || board[0];

      // List of alive opponents
      const aliveOpponents = playerList.filter(p => p.id !== player.id && stats[p.id]?.isAlive);
      const allAlivePlayers = playerList.filter(p => stats[p.id]?.isAlive);

      // Default active target tab to first alive opponent
      if (!activeTargetPlayerId || !playerList.some(p => p.id === activeTargetPlayerId)) {
        if (aliveOpponents.length > 0) {
          activeTargetPlayerId = aliveOpponents[0].id;
        }
      }

      const activeTargetPlayer = playerList.find(p => p.id === activeTargetPlayerId);
      const eliminatedNotes = getEliminatedNotes(roomData.code, player.id, activeTargetPlayerId);

      // Top Status Bar: Secret Card, Alive/Spectator Badge, Score
      const topBarHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <button 
              onclick="App.returnToLobby()"
              class="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-900/10 font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              <span>Kembali</span>
            </button>

            <!-- Status Hidup/Gugur -->
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-display font-black border flex items-center gap-1.5 ${
                myIsAlive 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }">
                <span class="w-2 h-2 rounded-full ${myIsAlive ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}"></span>
                <span>${myIsAlive ? 'STATUS: HIDUP' : 'GUGUR (SPECTATOR)'}</span>
              </span>

              <!-- Poin -->
              <span class="px-3 py-1 rounded-full bg-violet-100 text-violet-900 border border-violet-300 text-xs font-display font-black">
                ⭐ ${myStat.points || 0} PTS
              </span>
            </div>
          </div>

          <!-- Secret Card Preview Button -->
          <div class="flex items-center gap-2">
            <button 
              onclick="GuessWhoGame.toggleSecretCardView()"
              class="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-display font-bold text-xs shadow-md shadow-sky-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span>Karakter Rahasiamu</span>
            </button>

            <div class="flex items-center gap-1.5 bg-white px-3 py-1 rounded-2xl border-2 border-slate-900/10 text-xs font-display font-bold text-slate-700 shadow-sm">
              <span class="text-slate-400">ROOM:</span>
              <span class="text-sky-700 font-extrabold tracking-widest">${roomData.code}</span>
            </div>
          </div>
        </div>
      `;

      // Secret Card Popover / Display
      const secretCardPopoverHTML = showSecretCardModal && mySecretCard ? `
        <div class="mb-4 p-4 rounded-3xl bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-sky-500/20 border-2 border-sky-400/40 shadow-sm flex items-center justify-between gap-4 animate-float">
          <div class="flex items-center gap-3.5">
            <div class="w-14 h-18 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 aspect-[3/4]">
              <img src="${mySecretCard.image}" alt="${mySecretCard.name}" referrerpolicy="no-referrer" class="w-full h-full object-cover">
            </div>
            <div>
              <span class="text-[10px] font-display font-bold uppercase tracking-wider text-sky-800 bg-white/70 px-2 py-0.5 rounded-full border border-sky-200">
                Karakter Rahasiamu (Jaga Kerahasiaannya!)
              </span>
              <h3 class="font-display font-black text-lg sm:text-xl text-slate-900 mt-0.5">
                ${mySecretCard.name}
              </h3>
              <p class="font-body text-xs text-slate-600">${mySecretCard.role || 'Karakter Pilihan'}</p>
            </div>
          </div>
          <button 
            onclick="GuessWhoGame.toggleSecretCardView()"
            class="text-xs p-1.5 rounded-xl hover:bg-white/60 text-slate-500 hover:text-slate-800"
            title="Tutup Preview"
          >
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      ` : '';

      // Joyful Event Broadcast Banner (Last guess outcome)
      let broadcastBannerHTML = '';
      if (gameState.lastEvent && gameState.lastEvent.type !== 'START') {
        const ev = gameState.lastEvent;
        if (ev.type === 'CORRECT') {
          broadcastBannerHTML = `
            <div class="mb-4 p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 shadow-md flex items-center gap-3 animate-float">
              <div class="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow">
                🎯
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[10px] font-display font-bold uppercase tracking-wider text-emerald-800">
                  TEPAT SASARAN! (+10 POIN)
                </div>
                <div class="text-xs sm:text-sm font-display font-bold text-slate-900 leading-snug">
                  <span class="text-emerald-700">${ev.guesserName}</span> berhasil menebak karakter <span class="text-rose-600">${ev.targetName}</span> (<span class="underline">${ev.characterName}</span>)! <b>${ev.targetName} telah GUGUR!</b>
                </div>
              </div>
            </div>
          `;
        } else if (ev.type === 'WRONG') {
          broadcastBannerHTML = `
            <div class="mb-4 p-3.5 sm:p-4 rounded-2xl bg-rose-50 border-2 border-rose-500/30 shadow-sm flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow">
                ❌
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[10px] font-display font-bold uppercase tracking-wider text-rose-800">
                  SALAH TEBAK! (-5 POIN)
                </div>
                <div class="text-xs sm:text-sm font-display font-semibold text-slate-900">
                  <span class="font-bold text-slate-800">${ev.guesserName}</span> gagal menebak karakter ${ev.targetName}. Karakter target tetap rahasia!
                </div>
              </div>
            </div>
          `;
        }
      }

      // Target Opponent Tabs (Elimination Notes per Target)
      const targetTabsHTML = playerList.filter(p => p.id !== player.id).map(p => {
        const isTargetAlive = stats[p.id]?.isAlive;
        const isActive = activeTargetPlayerId === p.id;
        const points = stats[p.id]?.points || 0;

        let tabStyle = '';
        if (isActive) {
          tabStyle = 'bg-sky-600 text-white shadow-md ring-4 ring-sky-500/20 font-bold scale-102';
        } else if (isTargetAlive) {
          tabStyle = 'bg-white text-slate-700 hover:bg-sky-50 border border-slate-200 font-semibold';
        } else {
          tabStyle = 'bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-70';
        }

        return `
          <button 
            onclick="GuessWhoGame.setActiveTarget('${p.id}')"
            class="px-3.5 py-1.5 rounded-full text-xs font-display flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${tabStyle}"
          >
            <span>${isTargetAlive ? '🎯' : '💀'} ${p.name} (${points} pts)</span>
          </button>
        `;
      }).join('');

      // Search & Guess Button Bar
      const controlsRowHTML = `
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <!-- Search Input -->
          <div class="relative flex-1 max-w-sm">
            <input 
              id="input-character-search"
              type="text" 
              placeholder="Cari nama karakter di papan..." 
              value="${localSearchQuery}"
              oninput="GuessWhoGame.handleSearch(this.value)"
              class="w-full pl-9 pr-8 py-2 rounded-2xl bg-white border-2 border-slate-900/10 text-xs font-display font-semibold text-slate-800 focus:outline-none focus:border-sky-500 shadow-sm"
            />
            <div class="absolute left-3 top-2.5 text-slate-400">
              <i data-lucide="search" class="w-4 h-4"></i>
            </div>
            ${localSearchQuery ? `
              <button onclick="GuessWhoGame.handleSearch('')" class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            ` : ''}
          </div>

          <!-- Guess Button & Reset Notes -->
          <div class="flex items-center gap-2">
            ${myIsAlive ? `
              <button 
                onclick="GuessWhoGame.openGuessModal()"
                class="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-display font-black text-xs sm:text-sm shadow-md shadow-amber-400/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-500/40"
              >
                <i data-lucide="crosshair" class="w-4 h-4"></i>
                <span>Tebak Karakter Lawan 🎯</span>
              </button>
            ` : `
              <div class="px-4 py-2 rounded-2xl bg-slate-100 border text-slate-500 font-display font-semibold text-xs text-center">
                Kamu sedang menonton (Spectator)
              </div>
            `}

            <button 
              onclick="GuessWhoGame.resetTargetNotes()"
              class="px-3 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-display font-bold transition-all"
              title="Reset Coretan Target Ini"
            >
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;

      // Filter board by search query
      const filteredBoard = board.filter(c => {
        if (!localSearchQuery) return true;
        return c.name.toLowerCase().includes(localSearchQuery.toLowerCase());
      });

      // Grid Kartu Wajah Karakter (3:4 Ratio, Smooth Elimination Grayscale & Red X)
      const characterGridHTML = filteredBoard.map(card => {
        const isEliminated = eliminatedNotes.has(card.id);

        const cardClasses = isEliminated 
          ? 'grayscale contrast-75 opacity-40 border-slate-300' 
          : 'border-slate-900/10 hover:border-sky-400 hover:shadow-md';

        return `
          <div 
            onclick="GuessWhoGame.toggleEliminate('${card.id}')"
            class="relative rounded-2xl overflow-hidden border-2 transition-all duration-200 select-none cursor-pointer bg-white group aspect-[3/4] ${cardClasses}"
          >
            <!-- Gambar Karakter -->
            <img 
              src="${card.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(card.name)}&background=0284c7&color=fff&size=200`}" 
              alt="${card.name}"
              loading="lazy"
              referrerpolicy="no-referrer"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(card.name)}&background=0284c7&color=fff&size=200'"
            />

            <!-- Nama Karakter di Bagian Bawah -->
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-900/70 to-transparent p-2 pt-4 text-center">
              <span class="font-display font-bold text-[11px] sm:text-xs text-white leading-tight block truncate drop-shadow-sm">
                ${card.name}
              </span>
            </div>

            <!-- Overlay Silang Merah Lembut saat Dicoret/Dieliminasi -->
            ${isEliminated ? `
              <div class="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-[0.5px]">
                <div class="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-white scale-110">
                  <i data-lucide="x" class="w-6 h-6 stroke-[3]"></i>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      containerEl.innerHTML = `
        <div class="w-full flex flex-col justify-between">
          ${topBarHTML}
          ${secretCardPopoverHTML}
          ${broadcastBannerHTML}

          <!-- Tab Catatan Lawan -->
          <div class="mb-3">
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span class="text-xs font-display font-bold text-slate-400 shrink-0">Catatan Target:</span>
              ${targetTabsHTML}
            </div>
            ${activeTargetPlayer ? `
              <p class="text-[11px] font-body text-slate-400 mt-1">
                💡 Coretan di bawah khusus untuk mengeliminasi karakter <b class="text-slate-700">${activeTargetPlayer.name}</b>.
              </p>
            ` : ''}
          </div>

          ${controlsRowHTML}

          <!-- Grid Papan Karakter -->
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3 mb-6">
            ${characterGridHTML}
          </div>
        </div>
      `;

      // If game is over, automatically display Victory Podium
      if (isGameOver) {
        setTimeout(() => this.showVictoryModal(roomData, gameState), 400);
      }
    },

    /**
     * Search input handler
     */
    handleSearch(val) {
      localSearchQuery = val;
      const appEl = document.getElementById('app');
      if (appEl && currentRoom && currentPlayer) {
        this.render(appEl, currentRoom, currentPlayer);
      }
    },

    /**
     * Switch active target player tab for local notes
     */
    setActiveTarget(targetId) {
      activeTargetPlayerId = targetId;
      UI.Sound.click();
      const appEl = document.getElementById('app');
      if (appEl && currentRoom && currentPlayer) {
        this.render(appEl, currentRoom, currentPlayer);
      }
    },

    /**
     * Toggle elimination of character under active target tab
     */
    toggleEliminate(characterId) {
      if (!currentRoom || !currentPlayer || !activeTargetPlayerId) return;

      const notes = getEliminatedNotes(currentRoom.code, currentPlayer.id, activeTargetPlayerId);
      if (notes.has(characterId)) {
        notes.delete(characterId);
        UI.Sound.click();
      } else {
        notes.add(characterId);
        UI.Sound.pop();
      }

      saveEliminatedNotes(currentRoom.code, currentPlayer.id, activeTargetPlayerId, notes);

      const appEl = document.getElementById('app');
      if (appEl) {
        this.render(appEl, currentRoom, currentPlayer);
      }
    },

    /**
     * Reset notes for current target tab
     */
    resetTargetNotes() {
      if (!currentRoom || !currentPlayer || !activeTargetPlayerId) return;
      saveEliminatedNotes(currentRoom.code, currentPlayer.id, activeTargetPlayerId, new Set());
      UI.Sound.click();
      UI.Toast('Coretan target ini direset.', 'info');

      const appEl = document.getElementById('app');
      if (appEl) {
        this.render(appEl, currentRoom, currentPlayer);
      }
    },

    /**
     * Toggle preview of player's secret card
     */
    toggleSecretCardView() {
      showSecretCardModal = !showSecretCardModal;
      UI.Sound.flip();
      const appEl = document.getElementById('app');
      if (appEl && currentRoom && currentPlayer) {
        this.render(appEl, currentRoom, currentPlayer);
      }
    },

    /**
     * ==========================================================================
     * FITUR TEBAK KARAKTER LAWAN (MODAL REUSABLE)
     * ==========================================================================
     */
    openGuessModal() {
      if (!currentRoom || !currentPlayer) return;

      const gameState = getGameState(currentRoom);
      const stats = gameState.playerStats || {};

      // Player must be alive to guess
      if (!stats[currentPlayer.id]?.isAlive) {
        UI.Toast('Pemain yang sudah gugur tidak dapat menebak!', 'warning');
        return;
      }

      const playerList = Object.values(currentRoom.players || {});
      const board = gameState.boardCharacters || [];

      // Alive opponents
      const aliveOpponents = playerList.filter(p => p.id !== currentPlayer.id && stats[p.id]?.isAlive);
      if (aliveOpponents.length === 0) {
        UI.Toast('Tidak ada lawan hidup yang tersisa untuk ditebak!', 'warning');
        return;
      }

      const defaultTarget = aliveOpponents[0];

      // Modal Content with Opponent Selector & Character Selector
      const opponentOptionsHTML = aliveOpponents.map((op, idx) => `
        <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 cursor-pointer bg-slate-50 has-[:checked]:bg-sky-50 has-[:checked]:border-sky-600 transition-all">
          <input type="radio" name="guess_target_player" value="${op.id}" ${idx === 0 ? 'checked' : ''} class="text-sky-600 focus:ring-sky-500">
          <span class="font-display font-bold text-xs text-slate-800">${op.name}</span>
        </label>
      `).join('');

      const characterOptionsHTML = board.map(c => `
        <option value="${c.id}">${c.name}</option>
      `).join('');

      const modalContent = `
        <div class="space-y-4">
          <div class="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs font-body">
            ⚠️ <b>Aturan Tebak Battle Royale:</b><br>
            • Tebakan <b>BENAR</b>: +10 Poin & Lawan Gugur Permanen!<br>
            • Tebakan <b>SALAH</b>: -5 Poin (Karakter lawan tetap rahasia).
          </div>

          <div>
            <label class="block font-display font-bold text-xs text-slate-700 mb-1.5">
              1. Pilih Lawan yang Ingin Ditebak:
            </label>
            <div class="grid grid-cols-2 gap-2">
              ${opponentOptionsHTML}
            </div>
          </div>

          <div>
            <label class="block font-display font-bold text-xs text-slate-700 mb-1.5">
              2. Pilih Karakter yang Kamu Curigai:
            </label>
            <select 
              id="select-guess-character" 
              class="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-200 font-display font-semibold text-xs text-slate-800 focus:border-sky-500 focus:outline-none"
            >
              ${characterOptionsHTML}
            </select>
          </div>
        </div>
      `;

      const modalFooter = `
        <button 
          onclick="UI.closeModal()" 
          class="px-4 py-2 rounded-xl text-xs font-display font-semibold text-slate-500 hover:text-slate-700"
        >
          Batal
        </button>
        <button 
          onclick="GuessWhoGame.submitGuess()" 
          class="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-display font-bold text-xs shadow-md border border-amber-500/40"
        >
          Kirim Tebakan Sekarang ⚡
        </button>
      `;

      UI.Modal({
        title: 'Tebak Karakter Lawan 🎯',
        content: modalContent,
        footer: modalFooter
      });
    },

    /**
     * Submit and validate the guess
     */
    async submitGuess() {
      if (!currentRoom || !currentPlayer) return;

      const targetRadio = document.querySelector('input[name="guess_target_player"]:checked');
      const charSelect = document.getElementById('select-guess-character');

      const targetPlayerId = targetRadio?.value;
      const guessedCharId = charSelect?.value;

      if (!targetPlayerId || !guessedCharId) {
        UI.Toast('Pilih lawan dan karakter yang ingin ditebak!', 'warning');
        return;
      }

      UI.closeModal();

      try {
        const gameState = getGameState(currentRoom);
        const stats = { ...(gameState.playerStats || {}) };

        // Player must be alive
        if (!stats[currentPlayer.id]?.isAlive) {
          UI.Toast('Pemain yang sudah gugur tidak dapat menebak!', 'warning');
          return;
        }

        const playerList = Object.values(currentRoom.players || {});
        if (!stats[currentPlayer.id]) stats[currentPlayer.id] = { isAlive: true, points: 0 };
        if (!stats[targetPlayerId]) stats[targetPlayerId] = { isAlive: true, points: 0 };

        const targetPlayer = currentRoom.players ? currentRoom.players[targetPlayerId] : null;
        const realSecretId = gameState.playerSecrets ? gameState.playerSecrets[targetPlayerId] : null;
        const guessedCard = (gameState.boardCharacters || []).find(c => c.id === guessedCharId);

        const isCorrect = (realSecretId === guessedCharId);

        UI.Logger('GUESS-WHO', `Guess submitted by ${currentPlayer.name} against ${targetPlayer?.name}: guess=${guessedCharId}, real=${realSecretId}, correct=${isCorrect}`);

        if (isCorrect) {
          // TEPAT SASARAN (+10 Poin & Target Gugur Permanen)
          stats[currentPlayer.id].points = (stats[currentPlayer.id].points || 0) + 10;
          stats[targetPlayerId].isAlive = false;
          stats[targetPlayerId].eliminatedBy = currentPlayer.name;

          UI.Sound.fanfare();
          UI.Confetti();
          UI.Toast(`🎯 TEPAT SASARAN! Kamu berhasil menebak ${targetPlayer?.name} (${guessedCard?.name})! (+10 Poin)`, 'success', 5000);

          // Check if Last Man Standing remains
          const aliveRemaining = playerList.filter(p => stats[p.id]?.isAlive);
          const isGameOver = aliveRemaining.length <= 1;
          const winner = isGameOver ? (aliveRemaining[0] || currentPlayer) : null;

          await DB.updateGameState(currentRoom.code, 'guessWho', {
            playerStats: stats,
            status: isGameOver ? 'gameover' : 'playing',
            winnerId: winner ? winner.id : null,
            lastEvent: {
              type: 'CORRECT',
              guesserName: currentPlayer.name,
              targetName: targetPlayer?.name || 'Lawan',
              characterName: guessedCard?.name || 'Karakter',
              timestamp: Date.now()
            }
          });
        } else {
          // SALAH TEBAK (-5 Poin, rahasia target tetap aman)
          stats[currentPlayer.id].points = (stats[currentPlayer.id].points || 0) - 5;

          UI.Toast(`❌ SALAH TEBAK! ${targetPlayer?.name} BUKAN ${guessedCard?.name}! (-5 Poin)`, 'error', 4500);

          await DB.updateGameState(currentRoom.code, 'guessWho', {
            playerStats: stats,
            lastEvent: {
              type: 'WRONG',
              guesserName: currentPlayer.name,
              targetName: targetPlayer?.name || 'Lawan',
              timestamp: Date.now()
            }
          });
        }
      } catch (err) {
        UI.Logger('GUESS-WHO', 'Error submitting guess:', err, true);
        UI.Toast('Gagal memproses tebakan: ' + (err.message || err), 'error');
      }
    },

    /**
     * ==========================================================================
     * KONDISI MENANG AKHIR (LAST MAN STANDING) & MODAL PODIUM
     * ==========================================================================
     */
    showVictoryModal(roomData, gameState) {
      const playerList = Object.values(roomData.players || {});
      const stats = gameState.playerStats || {};
      const winnerId = gameState.winnerId;
      const winner = playerList.find(p => p.id === winnerId) || playerList[0];

      // Sort leaderboard by points descending
      const ranked = [...playerList].sort((a, b) => {
        const ptsA = stats[a.id]?.points || 0;
        const ptsB = stats[b.id]?.points || 0;
        return ptsB - ptsA;
      });

      const leaderboardRowsHTML = ranked.map((p, idx) => {
        const isWinner = p.id === winner?.id;
        const stat = stats[p.id] || {};
        const isAlive = Boolean(stat.isAlive);
        const pts = stat.points || 0;

        return `
          <tr class="border-b border-slate-100 ${isWinner ? 'bg-amber-50/50 font-bold' : ''}">
            <td class="py-2.5 px-3 font-display text-xs text-slate-500">#${idx + 1}</td>
            <td class="py-2.5 px-3 flex items-center gap-2">
              ${UI.Avatar({ name: p.name, size: 'sm', isHost: p.isHost, colorIndex: p.colorIndex || idx })}
              <span class="font-display font-bold text-xs text-slate-800">${p.name}</span>
            </td>
            <td class="py-2.5 px-3 text-center">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-display font-bold ${
                isAlive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }">
                ${isAlive ? 'SURVIVOR' : 'GUGUR'}
              </span>
            </td>
            <td class="py-2.5 px-3 text-right font-display font-black text-xs text-violet-700">
              ${pts} PTS
            </td>
          </tr>
        `;
      }).join('');

      const modalContent = `
        <div class="text-center py-3">
          <div class="w-16 h-16 mx-auto mb-3 rounded-3xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-3xl shadow-lg border-2 border-white animate-float">
            🏆
          </div>
          <span class="text-xs font-display font-extrabold tracking-wider uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Last Survivor Battle Royale
          </span>
          <h2 class="font-display font-black text-2xl text-slate-900 mt-2">
            Selamat kepada ${winner?.name || 'Pemenang'}!
          </h2>
          <p class="font-body text-xs text-slate-500 mt-1 mb-5">
            Berhasil bertahan sebagai pemain terakhir yang tidak tertebak karakternya!
          </p>

          <div class="rounded-2xl border border-slate-200 overflow-hidden mb-4 text-left shadow-xs">
            <table class="w-full">
              <thead class="bg-slate-50 border-b border-slate-200 text-[10px] font-display uppercase tracking-wider text-slate-400">
                <tr>
                  <th class="py-2 px-3">Rank</th>
                  <th class="py-2 px-3">Pemain</th>
                  <th class="py-2 px-3 text-center">Status</th>
                  <th class="py-2 px-3 text-right">Poin</th>
                </tr>
              </thead>
              <tbody>
                ${leaderboardRowsHTML}
              </tbody>
            </table>
          </div>
        </div>
      `;

      const isHost = Boolean(currentPlayer?.isHost);
      const modalFooter = `
        ${isHost ? `
          <button 
            onclick="GuessWhoGame.restartGame()" 
            class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-display font-bold text-xs shadow"
          >
            Mulai Ronde Baru 🔄
          </button>
        ` : ''}
        <button 
          onclick="App.returnToLobby()" 
          class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs"
        >
          Kembali ke Lobby 🏠
        </button>
      `;

      UI.Confetti();
      UI.Modal({
        title: 'Hasil Pertandingan Battle Royale 🏁',
        content: modalContent,
        footer: modalFooter
      });
    },

    /**
     * Restart game to config or new round
     */
    async restartGame() {
      if (!currentRoom || !currentPlayer?.isHost) return;
      UI.closeModal();
      UI.Sound.click();

      await DB.updateGameState(currentRoom.code, 'guessWho', {
        status: 'config',
        winnerId: null,
        playerSecrets: {},
        playerStats: {},
        lastEvent: null
      });
    },

    /**
     * Cleanup on leaving module
     */
    cleanup() {
      showSecretCardModal = false;
      localSearchQuery = '';
      UI.Logger('GUESS-WHO', 'Cleaned up GuessWhoGame state');
    }
  };
})();

if (typeof window !== 'undefined') {
  window.GuessWhoGame = GuessWhoGame;
}
