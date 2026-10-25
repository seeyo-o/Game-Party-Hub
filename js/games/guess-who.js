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
      'all-anime': [
        { id: 'an_1', name: 'Naruto Uzumaki', role: 'Shinobi', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80' },
        { id: 'an_2', name: 'Monkey D. Luffy', role: 'Pirate Captain', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&q=80' },
        { id: 'an_3', name: 'Roronoa Zoro', role: 'Swordsman', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&q=80' },
        { id: 'an_4', name: 'Satoru Gojo', role: 'Special Grade Sorcerer', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80' },
        { id: 'an_5', name: 'Yuji Itadori', role: 'Jujutsu Student', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&q=80' },
        { id: 'an_6', name: 'Eren Yeager', role: 'Attack Titan', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80' },
        { id: 'an_7', name: 'Levi Ackerman', role: 'Captain', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80' },
        { id: 'an_8', name: 'Mikasa Ackerman', role: 'Scout Soldier', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80' },
        { id: 'an_9', name: 'Rimuru Tempest', role: 'Demon Lord', image: 'https://images.unsplash.com/photo-1569074187119-c87815b476da?w=300&q=80' },
        { id: 'an_10', name: 'Asta', role: 'Black Bull Knight', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80' },
        { id: 'an_11', name: 'Yami Sukehiro', role: 'Squad Captain', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80' },
        { id: 'an_12', name: 'Hinata Shoyo', role: 'Middle Blocker', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
        { id: 'an_13', name: 'Kageyama Tobio', role: 'Setter', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80' },
        { id: 'an_14', name: 'Kakashi Hatake', role: 'Copy Ninja', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80' },
        { id: 'an_15', name: 'Sasuke Uchiha', role: 'Avenger', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
        { id: 'an_16', name: 'Itachi Uchiha', role: 'Rogue Shinobi', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80' },
        { id: 'an_17', name: 'Nami', role: 'Navigator', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
        { id: 'an_18', name: 'Sanji', role: 'Cook', image: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=300&q=80' },
        { id: 'an_19', name: 'Megumi Fushiguro', role: 'Shadow Sorcerer', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80' },
        { id: 'an_20', name: 'Nobara Kugisaki', role: 'Straw Doll Sorcerer', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80' },
        { id: 'an_21', name: 'Armin Arlert', role: 'Colossal Titan', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80' },
        { id: 'an_22', name: 'Benimaru', role: 'Samurai General', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&q=80' },
        { id: 'an_23', name: 'Yuno Grinberryall', role: 'Golden Dawn Knight', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80' },
        { id: 'an_24', name: 'Oikawa Tooru', role: 'Grand King Setter', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80' },
        { id: 'an_25', name: 'Tanjiro Kamado', role: 'Demon Slayer', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&q=80' },
        { id: 'an_26', name: 'Nezuko Kamado', role: 'Demon Girl', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80' },
        { id: 'an_27', name: 'Zenitsu Agatsuma', role: 'Thunder Slayer', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
        { id: 'an_28', name: 'Inosuke Hashibira', role: 'Beast Slayer', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80' },
        { id: 'an_29', name: 'Giyu Tomioka', role: 'Water Hashira', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
        { id: 'an_30', name: 'Kyojuro Rengoku', role: 'Flame Hashira', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80' },
        { id: 'an_31', name: 'Saitama', role: 'One Punch Hero', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80' },
        { id: 'an_32', name: 'Genos', role: 'Demon Cyborg', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80' },
        { id: 'an_33', name: 'Killua Zoldyck', role: 'Assassin Hunter', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80' },
        { id: 'an_34', name: 'Gon Freecss', role: 'Rookie Hunter', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80' },
        { id: 'an_35', name: 'Hisoka Morow', role: 'Magician', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80' },
        { id: 'an_36', name: 'Light Yagami', role: 'Kira', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80' },
        { id: 'an_37', name: 'L Lawliet', role: 'Great Detective', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&q=80' },
        { id: 'an_38', name: 'Ryuk', role: 'Shinigami', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80' },
        { id: 'an_39', name: 'Erwin Smith', role: 'Commander', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80' },
        { id: 'an_40', name: 'Hange Zoe', role: 'Section Commander', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
        { id: 'an_41', name: 'Trafalgar Law', role: 'Surgeon of Death', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
        { id: 'an_42', name: 'Portgas D. Ace', role: 'Fire Fist', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80' },
        { id: 'an_43', name: 'Boa Hancock', role: 'Pirate Empress', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80' },
        { id: 'an_44', name: 'Nico Robin', role: 'Archaeologist', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80' },
        { id: 'an_45', name: 'Kento Nanami', role: 'Grade 1 Sorcerer', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80' },
        { id: 'an_46', name: 'Ryomen Sukuna', role: 'King of Curses', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80' },
        { id: 'an_47', name: 'Maki Zenin', role: 'Cursed Weapon Specialist', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
        { id: 'an_48', name: 'Toge Inumaki', role: 'Cursed Speech User', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' }
      ],

      'tokoh-indonesia': [
        { id: 'ti_1', name: 'Ir. Soekarno', role: 'Proklamator & Presiden RI 1', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
        { id: 'ti_2', name: 'Mohammad Hatta', role: 'Proklamator & Wapres RI 1', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
        { id: 'ti_3', name: 'B.J. Habibie', role: 'Presiden RI 3 & Ilmuwan', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80' },
        { id: 'ti_4', name: 'R.A. Kartini', role: 'Pahlawan Emansipasi', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80' },
        { id: 'ti_5', name: 'Ki Hajar Dewantara', role: 'Bapak Pendidikan Nasional', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80' },
        { id: 'ti_6', name: 'Jenderal Soedirman', role: 'Panglima Besar TNI', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80' },
        { id: 'ti_7', name: 'Gus Dur (Abdurrahman Wahid)', role: 'Presiden RI 4 & Tokoh Pluralisme', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80' },
        { id: 'ti_8', name: 'Bung Tomo', role: 'Pahlawan Pertempuran Surabaya', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80' },
        { id: 'ti_9', name: 'Raden Saleh', role: 'Pelukis Romantisisme Klasik', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80' },
        { id: 'ti_10', name: 'Cut Nyak Dien', role: 'Pahlawan Kemerdekaan Aceh', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80' },
        { id: 'ti_11', name: 'Iwan Fals', role: 'Musisi Balada Legendaris', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&q=80' },
        { id: 'ti_12', name: 'Chrisye', role: 'Legenda Musik Pop Indonesia', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80' },
        { id: 'ti_13', name: 'Benyamin Sueb', role: 'Budayawan & Bintang Betawi', image: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=300&q=80' },
        { id: 'ti_14', name: 'Najwa Shihab', role: 'Jurnalis & Tuan Rumah Narasi', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
        { id: 'ti_15', name: 'Taufik Hidayat', role: 'Legenda Bulu Tangkis Olimpiade', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
        { id: 'ti_16', name: 'Susi Susanti', role: 'Peraih Medali Emas Olimpiade 1992', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80' },
        { id: 'ti_17', name: 'Raffi Ahmad', role: 'Presenter & Entreprenur', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80' },
        { id: 'ti_18', name: 'Reza Rahadian', role: 'Aktor Film Terkemuka', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
        { id: 'ti_19', name: 'Dian Sastrowardoyo', role: 'Aktris & Produser Film', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80' },
        { id: 'ti_20', name: 'Joe Taslim', role: 'Aktor Laga Hollywood', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80' },
        { id: 'ti_21', name: 'Iko Uwais', role: 'Koreografer & Bintang The Raid', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80' },
        { id: 'ti_22', name: 'Agnez Mo', role: 'Penyanyi Internasional', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80' },
        { id: 'ti_23', name: 'W.S. Rendra', role: 'Penyair Si Burung Merak', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80' },
        { id: 'ti_24', name: 'Titiek Puspa', role: 'Penyanyi & Komponis Senior', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80' }
      ],

      'tokoh-dunia': [
        { id: 'td_1', name: 'Albert Einstein', role: 'Fisikawan Teori Relativitas', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
        { id: 'td_2', name: 'Leonardo da Vinci', role: 'Polimatik & Pelukis Mona Lisa', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80' },
        { id: 'td_3', name: 'Isaac Newton', role: 'Bapak Gravitasi & Kalkulus', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
        { id: 'td_4', name: 'Marie Curie', role: 'Pionir Radioaktivitas Nobelis', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80' },
        { id: 'td_5', name: 'Nikola Tesla', role: 'Penemu Listrik Arus Bolak-Balik', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80' },
        { id: 'td_6', name: 'Steve Jobs', role: 'Pendiri Apple & Visioner', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80' },
        { id: 'td_7', name: 'Elon Musk', role: 'Bos Tesla & SpaceX', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80' },
        { id: 'td_8', name: 'Bill Gates', role: 'Pendiri Microsoft & Filantropis', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80' },
        { id: 'td_9', name: 'Stephen Hawking', role: 'Kosmolog Teori Lubang Hitam', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&q=80' },
        { id: 'td_10', name: 'Charles Darwin', role: 'Pencetus Teori Evolusi', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80' },
        { id: 'td_11', name: 'William Shakespeare', role: 'Pujangga Teater Inggris', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80' },
        { id: 'td_12', name: 'Ludwig van Beethoven', role: 'Komponis Simfoni No. 9', image: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=300&q=80' },
        { id: 'td_13', name: 'Cristiano Ronaldo', role: 'Megabintang Sepak Bola CR7', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
        { id: 'td_14', name: 'Lionel Messi', role: 'Kapten Juara Dunia Argentina', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
        { id: 'td_15', name: 'Michael Jordan', role: 'Ikon Legenda Basket NBA', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80' },
        { id: 'td_16', name: 'Muhammad Ali', role: 'Juara Tinju Dunia The Greatest', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80' },
        { id: 'td_17', name: 'Taylor Swift', role: 'Penyanyi & Penulis Lagu Global', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80' },
        { id: 'td_18', name: 'Freddie Mercury', role: 'Vokalis Karismatik Queen', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80' },
        { id: 'td_19', name: 'Michael Jackson', role: 'King of Pop Dunia', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80' },
        { id: 'td_20', name: 'Nelson Mandela', role: 'Tokoh Anti-Apartheid & Perdamaian', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80' },
        { id: 'td_21', name: 'Mahatma Gandhi', role: 'Pemimpin Gerakan Nir-Kekerasan', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&q=80' },
        { id: 'td_22', name: 'Barack Obama', role: 'Presiden AS ke-44', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80' },
        { id: 'td_23', name: 'Vincent van Gogh', role: 'Pelukis The Starry Night', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80' },
        { id: 'td_24', name: 'Wolfgang Amadeus Mozart', role: 'Komponis Klasik Jenius', image: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=300&q=80' }
      ],

      'superhero': [
        { id: 'sh_1', name: 'Iron Man (Tony Stark)', role: 'Armored Avenger', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&q=80' },
        { id: 'sh_2', name: 'Spider-Man (Peter Parker)', role: 'Web-Slinger', image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&q=80' },
        { id: 'sh_3', name: 'Captain America (Steve Rogers)', role: 'First Avenger', image: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=300&q=80' },
        { id: 'sh_4', name: 'Thor Odinson', role: 'God of Thunder', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&q=80' },
        { id: 'sh_5', name: 'The Hulk (Bruce Banner)', role: 'Green Behemoth', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80' },
        { id: 'sh_6', name: 'Black Widow (Natasha Romanoff)', role: 'Super Spy', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80' },
        { id: 'sh_7', name: 'Doctor Strange (Stephen Strange)', role: 'Sorcerer Supreme', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80' },
        { id: 'sh_8', name: 'Black Panther (T\'Challa)', role: 'King of Wakanda', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
        { id: 'sh_9', name: 'Scarlet Witch (Wanda Maximoff)', role: 'Chaos Magic User', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80' },
        { id: 'sh_10', name: 'Wolverine (Logan)', role: 'Adamantium Mutant', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80' },
        { id: 'sh_11', name: 'Deadpool (Wade Wilson)', role: 'Merc with a Mouth', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80' },
        { id: 'sh_12', name: 'Batman (Bruce Wayne)', role: 'Dark Knight', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80' },
        { id: 'sh_13', name: 'Superman (Clark Kent)', role: 'Man of Steel', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
        { id: 'sh_14', name: 'Wonder Woman (Diana Prince)', role: 'Amazon Warrior Princess', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80' },
        { id: 'sh_15', name: 'The Flash (Barry Allen)', role: 'Scarlet Speedster', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80' },
        { id: 'sh_16', name: 'Aquaman (Arthur Curry)', role: 'King of Atlantis', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80' },
        { id: 'sh_17', name: 'Joker', role: 'Clown Prince of Crime', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80' },
        { id: 'sh_18', name: 'Harley Quinn', role: 'Maid of Mischief', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80' },
        { id: 'sh_19', name: 'Green Lantern (Hal Jordan)', role: 'Emerald Knight', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80' },
        { id: 'sh_20', name: 'Cyborg (Victor Stone)', role: 'Cybernetic Titan', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&q=80' },
        { id: 'sh_21', name: 'Robin (Dick Grayson)', role: 'Boy Wonder', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80' },
        { id: 'sh_22', name: 'Catwoman (Selina Kyle)', role: 'Feline Burglar', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
        { id: 'sh_23', name: 'Shazam (Billy Batson)', role: 'Champion of Magic', image: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=300&q=80' },
        { id: 'sh_24', name: 'Hawkeye (Clint Barton)', role: 'Master Marksman', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80' }
      ],

      'movie-series': [
        { id: 'ms_1', name: 'Harry Potter', role: 'The Boy Who Lived', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
        { id: 'ms_2', name: 'Hermione Granger', role: 'Brightest Witch', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80' },
        { id: 'ms_3', name: 'Ron Weasley', role: 'Brave Gryffindor', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
        { id: 'ms_4', name: 'Albus Dumbledore', role: 'Hogwarts Headmaster', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80' },
        { id: 'ms_5', name: 'Severus Snape', role: 'Potions Master', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80' },
        { id: 'ms_6', name: 'Lord Voldemort', role: 'He Who Must Not Be Named', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80' },
        { id: 'ms_7', name: 'Jack Sparrow', role: 'Captain of Black Pearl', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80' },
        { id: 'ms_8', name: 'Sherlock Holmes', role: 'Consulting Detective', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80' },
        { id: 'ms_9', name: 'John Watson', role: 'Doctor & Biographer', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80' },
        { id: 'ms_10', name: 'Wednesday Addams', role: 'Nevermore Student', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80' },
        { id: 'ms_11', name: 'Walter White', role: 'Heisenberg', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&q=80' },
        { id: 'ms_12', name: 'Jesse Pinkman', role: 'Albuquerque Chemist', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&q=80' },
        { id: 'ms_13', name: 'Neo (Thomas Anderson)', role: 'The One (Matrix)', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&q=80' },
        { id: 'ms_14', name: 'Morpheus', role: 'Nebuchadnezzar Captain', image: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=300&q=80' },
        { id: 'ms_15', name: 'Katniss Everdeen', role: 'The Mockingjay', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80' },
        { id: 'ms_16', name: 'Peeta Mellark', role: 'District 12 Tribute', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80' },
        { id: 'ms_17', name: 'Gandalf the Grey', role: 'Wizard of Middle-earth', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80' },
        { id: 'ms_18', name: 'Frodo Baggins', role: 'Ring-bearer Hobbit', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80' },
        { id: 'ms_19', name: 'Legolas Greenleaf', role: 'Elven Archer', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
        { id: 'ms_20', name: 'Jon Snow', role: 'King in the North', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&q=80' },
        { id: 'ms_21', name: 'Daenerys Targaryen', role: 'Mother of Dragons', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
        { id: 'ms_22', name: 'Darth Vader', role: 'Sith Lord', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80' },
        { id: 'ms_23', name: 'Luke Skywalker', role: 'Jedi Knight', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80' },
        { id: 'ms_24', name: 'Indiana Jones', role: 'Adventuring Archaeologist', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80' }
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

      // 2. Curated Fallback Selection
      let baseDeck = this.DECKS[subTheme] || this.DECKS[category] || this.DECKS['all-anime'];
      if (!baseDeck || baseDeck.length === 0) {
        baseDeck = this.DECKS['all-anime'];
      }

      // Shuffle deck
      const shuffled = [...baseDeck].sort(() => 0.5 - Math.random());

      // If requested count > deck length, duplicate and adjust ids
      let result = [];
      while (result.length < targetCount) {
        for (const item of shuffled) {
          if (result.length >= targetCount) break;
          result.push({
            ...item,
            id: result.length < baseDeck.length ? item.id : `${item.id}_alt_${result.length}`
          });
        }
      }

      return result.slice(0, targetCount);
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
    return roomData.guessWhoGame || roomData.gameState?.guessWho || {};
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
              <img src="${mySecretCard.image}" alt="${mySecretCard.name}" class="w-full h-full object-cover">
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
              src="${card.image}" 
              alt="${card.name}"
              loading="lazy"
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

      const gameState = getGameState(currentRoom);
      const playerList = Object.values(currentRoom.players || {});
      const targetPlayer = playerList.find(p => p.id === targetPlayerId);
      const board = gameState.boardCharacters || [];
      const guessedCard = board.find(c => c.id === guessedCharId);

      const secrets = gameState.playerSecrets || {};
      const realSecretId = secrets[targetPlayerId];

      const stats = { ...(gameState.playerStats || {}) };
      if (!stats[currentPlayer.id]) stats[currentPlayer.id] = { isAlive: true, points: 0 };
      if (!stats[targetPlayerId]) stats[targetPlayerId] = { isAlive: true, points: 0 };

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
