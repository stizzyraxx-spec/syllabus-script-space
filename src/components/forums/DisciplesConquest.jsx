import React, { useState, useEffect, useRef } from "react";
import { db } from "@/api/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CHARACTERS = [
  { id: "peter", name: "Peter", emoji: "🧑‍💼", color: "#FF6B6B", description: "The Rock - Denial to Leadership", story: "From fisherman to apostle, facing temptation and martyrdom" },
  { id: "paul", name: "Paul", emoji: "👨‍✈️", color: "#4ECDC4", description: "The Missionary - Persecution to Glory", story: "From persecutor to persecuted, spreading the gospel" },
  { id: "mary_magdalene", name: "Mary Magdalene", emoji: "👩‍🦰", color: "#FFD93D", description: "The Redeemed - Darkness to Light", story: "From demon-possession to devoted disciple" },
  { id: "john", name: "John", emoji: "👨‍🎓", color: "#A8E6CF", description: "The Beloved - Intimacy with Christ", story: "Closest to Jesus, revealed deepest truths" },
  { id: "judas", name: "Judas Iscariot", emoji: "💔", color: "#8B0000", description: "The Betrayer - Temptation & Tragedy", story: "Faced ultimate temptation and devastating consequences" },
  { id: "thomas", name: "Thomas the Doubter", emoji: "🤔", color: "#FFB6C1", description: "The Skeptic - From Doubt to Faith", story: "Required proof, then proclaimed 'My Lord and My God'" },
  { id: "david", name: "King David", emoji: "👑", color: "#FFD700", description: "The Warrior King - Glory & Fall", story: "From shepherd boy to king, committing grave sins and repenting" },
  { id: "samson", name: "Samson", emoji: "💪", color: "#FF8C00", description: "The Strong Man - Desire & Redemption", story: "Consumed by lust, finding strength in weakness" },
  { id: "bathsheba", name: "Bathsheba", emoji: "👸", color: "#E6B8D7", description: "The Innocent - Victim to Survivor", story: "Tragic affair with David, became a wise mother" },
  { id: "jonah", name: "Jonah", emoji: "🐋", color: "#4169E1", description: "The Reluctant Prophet - Obedience", story: "Ran from God, swallowed by a whale, finally obeyed" },
  { id: "moses", name: "Moses", emoji: "🔱", color: "#696969", description: "The Liberator - Forty Years of Faith", story: "Led Israel through wilderness, never entered promised land" },
  { id: "solomon", name: "Solomon", emoji: "💎", color: "#FFD700", description: "The Wise King - Wisdom to Folly", story: "Wisest man alive, yet fell into idolatry" },
  { id: "elijah", name: "Elijah", emoji: "🔥", color: "#FF4500", description: "The Fire Prophet - Faith & Fear", story: "Called fire from heaven, then fled in terror from Jezebel" },
  { id: "job", name: "Job", emoji: "😢", color: "#A9A9A9", description: "The Sufferer - Faith Through Loss", story: "Lost everything, questioned God, found restoration" },
  { id: "abraham", name: "Abraham", emoji: "👨‍🦳", color: "#8B7355", description: "The Patriarch - Ultimate Test", story: "Called to sacrifice his only son, became father of nations" },
  { id: "jezebel", name: "Jezebel", emoji: "👿", color: "#800000", description: "The Wicked Queen - Pride & Fall", story: "Persecuted prophets, met violent end" },
  { id: "esther", name: "Esther", emoji: "👑", color: "#FF69B4", description: "The Hidden Savior - Courage in Crisis", story: "Orphan queen risked her life to save her people" },
  { id: "peter_denial", name: "Peter (After Denial)", emoji: "🙏", color: "#FF6B6B", description: "The Restored - Forgiveness", story: "After denying Jesus, became boldest apostle" },
  { id: "stephen", name: "Stephen", emoji: "🩸", color: "#DC143C", description: "The First Martyr - Faithful unto Death", story: "Faced false accusations and stoning for his faith" },
  { id: "ananias", name: "Ananias of Damascus", emoji: "🤝", color: "#90EE90", description: "The Faithful - Overcoming Fear", story: "Risked his life to minister to Saul/Paul" },
  { id: "demas", name: "Demas", emoji: "📜", color: "#A9A9A9", description: "The Unfaithful - Love of the World", story: "Abandoned Paul, chose worldly pursuits" },
  { id: "timothy", name: "Timothy", emoji: "📖", color: "#6495ED", description: "The Young Protégé - Overcoming Timidity", story: "Young pastor encouraged to be bold in faith" },
  { id: "phoebe", name: "Phoebe", emoji: "🚶‍♀️", color: "#DDA0DD", description: "The Deacon - Humble Service", story: "Servant of the church, trusted messenger of Paul" },
  { id: "lydia", name: "Lydia", emoji: "💜", color: "#9370DB", description: "The Businesswoman - First European Convert", story: "Purple cloth merchant, opened her home to Paul" },
  { id: "priscilla", name: "Priscilla", emoji: "👩‍🏫", color: "#FFB6C1", description: "The Teacher - Ministry Partnership", story: "Taught Apollos, worked alongside Aquila and Paul" },
];

const CHARACTER_JOURNEYS = {
  peter: [
    { place: "Sea of Galilee", event: "The Catch of Fish", x: 35, y: 25 },
    { place: "Caesarea Philippi", event: "The Confession", x: 50, y: 15 },
    { place: "Mount of Transfiguration", event: "Glory Revealed", x: 40, y: 30 },
    { place: "Gethsemane", event: "Sleeping While Jesus Prayed", x: 25, y: 35 },
    { place: "Courtyard", event: "The Denial", x: 28, y: 38 },
    { place: "Jerusalem", event: "First Sermon", x: 30, y: 40 },
  ],
  paul: [
    { place: "Damascus Road", event: "The Conversion", x: 60, y: 20 },
    { place: "Antioch", event: "Starting New Church", x: 55, y: 25 },
    { place: "Lystra", event: "Stoned & Left for Dead", x: 70, y: 30 },
    { place: "Athens", event: "Preaching to Philosophers", x: 45, y: 55 },
    { place: "Rome", event: "Under House Arrest", x: 50, y: 70 },
    { place: "Execution Ground", event: "Martyrdom", x: 48, y: 72 },
  ],
  mary_magdalene: [
    { place: "Magdala", event: "Demon Possession", x: 40, y: 22 },
    { place: "Pharisee's House", event: "Anointing Jesus' Feet", x: 35, y: 35 },
    { place: "Crucifixion", event: "At the Cross", x: 30, y: 38 },
    { place: "Tomb", event: "First Resurrection Witness", x: 32, y: 40 },
    { place: "Pentecost", event: "Receiving the Spirit", x: 30, y: 42 },
  ],
  david: [
    { place: "Bethlehem Fields", event: "Chosen as King", x: 25, y: 30 },
    { place: "Saul's Court", event: "Harp Player for King", x: 28, y: 32 },
    { place: "Valley of Elah", event: "Defeating Goliath", x: 30, y: 28 },
    { place: "Bathsheba's House", event: "The Great Sin", x: 33, y: 35 },
    { place: "Cave of Adullam", event: "Hiding from Saul", x: 35, y: 25 },
    { place: "Mount Zion", event: "Becoming King", x: 32, y: 35 },
  ],
  samson: [
    { place: "Dan", event: "Supernatural Birth", x: 45, y: 18 },
    { place: "Timnah", event: "Meeting Delilah", x: 25, y: 42 },
    { place: "Ashkelon", event: "Killing 30 Men", x: 20, y: 45 },
    { place: "Gaza", event: "Carrying City Gates", x: 18, y: 48 },
    { place: "Delilah's House", event: "Betrayal", x: 25, y: 42 },
    { place: "Philistine Temple", event: "Final Victory", x: 22, y: 46 },
  ],
  abraham: [
    { place: "Ur of the Chaldees", event: "The Call", x: 70, y: 35 },
    { place: "Canaan", event: "Promise of Land", x: 30, y: 35 },
    { place: "Egypt", event: "Testing Faith", x: 25, y: 55 },
    { place: "Mount Moriah", event: "Sacrifice Isaac", x: 32, y: 38 },
    { place: "Gerar", event: "Testing with Abimelech", x: 28, y: 48 },
  ],
  job: [
    { place: "Land of Uz", event: "Prosperity", x: 55, y: 40 },
    { place: "Job's House", event: "Loss Begins", x: 55, y: 40 },
    { place: "Ash Heap", event: "Complete Loss", x: 55, y: 40 },
    { place: "Friends' Arrival", event: "Testing Patience", x: 55, y: 40 },
    { place: "God's Presence", event: "Restoration", x: 55, y: 40 },
  ],
  esther: [
    { place: "Susa", event: "Orphan in Cousin's Home", x: 75, y: 35 },
    { place: "King's Palace", event: "Beauty Pageant", x: 76, y: 36 },
    { place: "Throne Room", event: "Becoming Queen", x: 76, y: 36 },
    { place: "Secret Gathering", event: "Fasting & Prayer", x: 76, y: 36 },
    { place: "King's Presence", event: "Risking Her Life", x: 76, y: 36 },
  ],
  jonah: [
    { place: "Nineveh", event: "Called to Preach", x: 65, y: 32 },
    { place: "Joppa Port", event: "Running from God", x: 28, y: 45 },
    { place: "Ship at Sea", event: "Storm & Lot Casting", x: 30, y: 50 },
    { place: "Whale's Belly", event: "Three Days Inside", x: 32, y: 52 },
    { place: "Nineveh", event: "Repentance of City", x: 65, y: 32 },
  ],
  moses: [
    { place: "Egypt", event: "Raised as Prince", x: 25, y: 60 },
    { place: "Midian", event: "Tending Sheep", x: 35, y: 65 },
    { place: "Mount Horeb", event: "Burning Bush", x: 38, y: 68 },
    { place: "Red Sea", event: "Parting the Waters", x: 30, y: 55 },
    { place: "Mount Sinai", event: "Receiving the Law", x: 35, y: 58 },
    { place: "Wilderness", event: "Forty Years", x: 35, y: 50 },
  ],
  solomon: [
    { place: "Jerusalem", event: "Chosen as King", x: 32, y: 35 },
    { place: "Gibeon", event: "Dream of Wisdom", x: 30, y: 33 },
    { place: "Temple", event: "Building God's House", x: 32, y: 35 },
    { place: "Palace", event: "Many Wives & Riches", x: 32, y: 35 },
    { place: "Temple Again", event: "Dedicating the Temple", x: 32, y: 35 },
  ],
  elijah: [
    { place: "Zarephath", event: "Raising Widow's Son", x: 40, y: 20 },
    { place: "Mount Carmel", event: "Fire from Heaven", x: 42, y: 25 },
    { place: "Jezreel", event: "Running from Jezebel", x: 40, y: 28 },
    { place: "Mount Horeb", event: "Still Small Voice", x: 38, y: 68 },
    { place: "Jordan River", event: "Ascending in Whirlwind", x: 35, y: 40 },
  ],
  stephen: [
    { place: "Jerusalem", event: "Great Wonders", x: 30, y: 35 },
    { place: "Synagogue", event: "Debate & Opposition", x: 31, y: 35 },
    { place: "Sanhedrin", event: "False Accusations", x: 30, y: 36 },
    { place: "City Gate", event: "Stoning", x: 29, y: 35 },
  ],
  lydia: [
    { place: "Thyatira", event: "Purple Cloth Merchant", x: 45, y: 40 },
    { place: "Philippi", event: "Meeting Paul", x: 50, y: 20 },
    { place: "River Gangites", event: "Conversion", x: 50, y: 20 },
    { place: "Her Home", event: "First Church House", x: 50, y: 20 },
  ],
  timothy: [
    { place: "Lystra", event: "Raised by Faithful Mother", x: 70, y: 30 },
    { place: "Paul's Side", event: "Becoming Disciple", x: 60, y: 25 },
    { place: "Ephesus", event: "Leading the Church", x: 72, y: 35 },
    { place: "Prison", event: "Encouraged by Paul", x: 30, y: 42 },
  ],
};

const CHARACTER_SCENARIOS = {
  peter: [
    [
      {
        title: "The Catch of Fish - Question 1",
        description: "After fishing all night with nothing, what did Peter do when Jesus asked him to cast nets again?",
        hint: "Jesus asked him to launch into deep water for a catch",
        options: [
          { text: "Obeyed immediately, caught so many the nets broke", correct: true, points: 10 },
          { text: "Complained about wasting time", correct: false, points: 0 },
          { text: "Refused and went home", correct: false, points: 0 },
        ],
      },
      {
        title: "The Catch of Fish - Question 2",
        description: "When Peter saw the miraculous catch, what was his immediate response?",
        hint: "He was overwhelmed by Jesus' power",
        options: [
          { text: "Fell at Jesus' feet in fear and reverence", correct: true, points: 10 },
          { text: "Demanded to know Jesus' secret", correct: false, points: 0 },
          { text: "Tried to take some fish home", correct: false, points: 0 },
        ],
      },
      {
        title: "The Catch of Fish - Question 3",
        description: "What did Jesus say Peter would now become?",
        hint: "Related to catching something different",
        options: [
          { text: "A fisher of men", correct: true, points: 10 },
          { text: "A teacher of the law", correct: false, points: 0 },
          { text: "A keeper of the temple", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "The Denial - Question 1",
        description: "When questioned about knowing Jesus, what did Peter do three times?",
        hint: "It happened while Jesus was being tried",
        options: [
          { text: "Denied knowing Jesus", correct: true, points: 10 },
          { text: "Bravely confessed his faith", correct: false, points: 0 },
          { text: "Silently stood by", correct: false, points: 0 },
        ],
      },
      {
        title: "The Denial - Question 2",
        description: "What caused Peter to remember Jesus' prediction about his denial?",
        hint: "An animal's sound",
        options: [
          { text: "A rooster crowed", correct: true, points: 10 },
          { text: "He saw Mary Magdalene", correct: false, points: 0 },
          { text: "A disciple confronted him", correct: false, points: 0 },
        ],
      },
      {
        title: "The Denial - Question 3",
        description: "How did Peter respond after realizing his denial?",
        hint: "He was deeply grieved",
        options: [
          { text: "Wept bitterly in repentance", correct: true, points: 10 },
          { text: "Fled the city immediately", correct: false, points: 0 },
          { text: "Tried to justify his actions", correct: false, points: 0 },
        ],
      },
    ],
  ],
  paul: [
    [
      {
        title: "Damascus Road Conversion - Question 1",
        description: "What happened to Saul on the Damascus Road?",
        hint: "A heavenly light appeared",
        options: [
          { text: "Met the risen Jesus and was struck blind", correct: true, points: 10 },
          { text: "Was attacked by robbers", correct: false, points: 0 },
          { text: "Saw a vision of an angel", correct: false, points: 4 },
        ],
      },
      {
        title: "Damascus Road Conversion - Question 2",
        description: "What was Saul doing before his encounter with Jesus?",
        hint: "He was persecuting believers",
        options: [
          { text: "Traveling to Damascus to arrest Christians", correct: true, points: 10 },
          { text: "Preaching in the synagogue", correct: false, points: 0 },
          { text: "Teaching Greek philosophy", correct: false, points: 0 },
        ],
      },
      {
        title: "Damascus Road Conversion - Question 3",
        description: "Who helped Paul recover his sight after his blindness?",
        hint: "A disciple in Damascus",
        options: [
          { text: "Ananias laid hands on him", correct: true, points: 10 },
          { text: "Peter came to heal him", correct: false, points: 0 },
          { text: "Jesus appeared to him again", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "Stoned at Lystra - Question 1",
        description: "After being called a god, then stoned by an angry mob, what did Paul do?",
        hint: "He was left for dead but recovered",
        options: [
          { text: "Got up and went back into the city to preach", correct: true, points: 10 },
          { text: "Fled and never returned", correct: false, points: 0 },
          { text: "Retired from ministry", correct: false, points: 0 },
        ],
      },
      {
        title: "Stoned at Lystra - Question 2",
        description: "Why did the crowd initially want to honor Paul and Barnabas as gods?",
        hint: "They performed a miracle",
        options: [
          { text: "They healed a crippled man", correct: true, points: 10 },
          { text: "They raised someone from the dead", correct: false, points: 0 },
          { text: "They turned water into wine", correct: false, points: 0 },
        ],
      },
      {
        title: "Stoned at Lystra - Question 3",
        description: "What changed the crowd's mind about Paul and Barnabas?",
        hint: "Jews from another city arrived",
        options: [
          { text: "Jealous Jews from other cities influenced them", correct: true, points: 10 },
          { text: "Paul said something offensive", correct: false, points: 0 },
          { text: "A natural disaster occurred", correct: false, points: 0 },
        ],
      },
    ],
  ],
  mary_magdalene: [
    [
      {
        title: "Demon Possession - Question 1",
        description: "When Jesus cast seven demons out of Mary, what was her response?",
        hint: "She became devoted to him",
        options: [
          { text: "Became his devoted follower", correct: true, points: 10 },
          { text: "Was afraid and hid", correct: false, points: 0 },
          { text: "Went back to her old ways", correct: false, points: 0 },
        ],
      },
      {
        title: "Demon Possession - Question 2",
        description: "How many demons had possessed Mary Magdalene?",
        hint: "It was seven",
        options: [
          { text: "Seven demons", correct: true, points: 10 },
          { text: "Three demons", correct: false, points: 0 },
          { text: "Twelve demons", correct: false, points: 0 },
        ],
      },
      {
        title: "Demon Possession - Question 3",
        description: "Where did Mary first encounter Jesus after her healing?",
        hint: "She followed him during ministry",
        options: [
          { text: "She became one of his followers in ministry", correct: true, points: 10 },
          { text: "She married one of the apostles", correct: false, points: 0 },
          { text: "She returned to Magdala", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "First Resurrection Witness - Question 1",
        description: "What did Mary do when she discovered Jesus' empty tomb?",
        hint: "She became the first to see the risen Christ",
        options: [
          { text: "Saw Jesus and became the first witness to resurrection", correct: true, points: 10 },
          { text: "Ran away in fear", correct: false, points: 0 },
          { text: "Told the disciples immediately", correct: false, points: 0 },
        ],
      },
      {
        title: "First Resurrection Witness - Question 2",
        description: "What did Jesus tell Mary to do after revealing himself?",
        hint: "She had a message to deliver",
        options: [
          { text: "Tell the disciples he is rising", correct: true, points: 10 },
          { text: "Prepare his body for burial", correct: false, points: 0 },
          { text: "Stay at the tomb and guard it", correct: false, points: 0 },
        ],
      },
      {
        title: "First Resurrection Witness - Question 3",
        description: "Why did Mary initially not recognize Jesus at the tomb?",
        hint: "She thought he was someone else",
        options: [
          { text: "She thought he was the gardener", correct: true, points: 10 },
          { text: "His appearance was completely changed", correct: false, points: 5 },
          { text: "She was too distraught to see clearly", correct: false, points: 0 },
        ],
      },
    ],
  ],
  david: [
    [
      {
        title: "Facing Goliath - Question 1",
        description: "When confronted by the giant Goliath, what did young David do?",
        hint: "He had only a sling",
        options: [
          { text: "Killed Goliath with a stone from his sling", correct: true, points: 10 },
          { text: "Tried to wear Saul's armor", correct: false, points: 4 },
          { text: "Fled in fear", correct: false, points: 0 },
        ],
      },
      {
        title: "Facing Goliath - Question 2",
        description: "What was David's main confidence in facing Goliath?",
        hint: "It was spiritual, not physical",
        options: [
          { text: "The Lord fights for his people", correct: true, points: 10 },
          { text: "He had trained since childhood", correct: false, points: 0 },
          { text: "He had Saul's blessing and armor", correct: false, points: 0 },
        ],
      },
      {
        title: "Facing Goliath - Question 3",
        description: "What did David do with Goliath's sword after defeating him?",
        hint: "A trophy of victory",
        options: [
          { text: "Used it as his own weapon", correct: true, points: 10 },
          { text: "Broke it in pieces", correct: false, points: 0 },
          { text: "Left it in the valley", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "The Great Sin - Question 1",
        description: "When David saw Bathsheba bathing, what was his choice?",
        hint: "He coveted another man's wife",
        options: [
          { text: "Sent for her and committed adultery", correct: true, points: 0 },
          { text: "Turned away and prayed for strength", correct: false, points: 10 },
          { text: "Confessed his desire to Bathsheba's husband", correct: false, points: 5 },
        ],
      },
      {
        title: "The Great Sin - Question 2",
        description: "What did David do to try to cover up his sin with Bathsheba?",
        hint: "He attempted deception",
        options: [
          { text: "Had her husband Uriah killed in battle", correct: true, points: 0 },
          { text: "Sent her away from Jerusalem", correct: false, points: 5 },
          { text: "Confessed immediately to Nathan", correct: false, points: 10 },
        ],
      },
      {
        title: "The Great Sin - Question 3",
        description: "How did David respond when confronted by the prophet Nathan?",
        hint: "He truly repented",
        options: [
          { text: "Repented with genuine sorrow and asked forgiveness", correct: true, points: 10 },
          { text: "Denied the charges against him", correct: false, points: 0 },
          { text: "Had Nathan imprisoned", correct: false, points: 0 },
        ],
      },
    ],
  ],
  samson: [
    [
      {
        title: "Meeting Delilah - Question 1",
        description: "When Samson fell in love with Delilah, the Philistine spy, what happened?",
        hint: "She worked to betray him",
        options: [
          { text: "He told her the secret of his strength and was betrayed", correct: true, points: 0 },
          { text: "He kept his secret safe from her", correct: false, points: 10 },
          { text: "He immediately left her", correct: false, points: 5 },
        ],
      },
      {
        title: "Meeting Delilah - Question 2",
        description: "What was the real source of Samson's supernatural strength?",
        hint: "It was a Nazirite vow",
        options: [
          { text: "His uncut hair symbolizing his covenant with God", correct: true, points: 10 },
          { text: "A special potion he drank", correct: false, points: 0 },
          { text: "His muscular training since youth", correct: false, points: 0 },
        ],
      },
      {
        title: "Meeting Delilah - Question 3",
        description: "How many times did Delilah try to trick Samson before he told her the truth?",
        hint: "She was persistent",
        options: [
          { text: "Three times with false answers, then he told the truth", correct: true, points: 10 },
          { text: "Once and he immediately confessed", correct: false, points: 0 },
          { text: "Never - he never told her", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "Final Strength - Question 1",
        description: "When blinded and imprisoned by Philistines, what did Samson do in the temple?",
        hint: "His hair had grown back",
        options: [
          { text: "Prayed and pushed down the temple, killing all inside", correct: true, points: 10 },
          { text: "Escaped in darkness", correct: false, points: 0 },
          { text: "Accepted captivity", correct: false, points: 0 },
        ],
      },
      {
        title: "Final Strength - Question 2",
        description: "What did Samson pray for when his hair grew back?",
        hint: "He sought vengeance",
        options: [
          { text: "One more chance to avenge his eyes and his people", correct: true, points: 10 },
          { text: "For forgiveness of his past sins", correct: false, points: 5 },
          { text: "For freedom and escape", correct: false, points: 0 },
        ],
      },
      {
        title: "Final Strength - Question 3",
        description: "In his final act, how many Philistines did Samson kill?",
        hint: "More than he killed in his lifetime",
        options: [
          { text: "More in his death than in his life", correct: true, points: 10 },
          { text: "Just the leaders who blinded him", correct: false, points: 0 },
          { text: "A few hundred soldiers", correct: false, points: 0 },
        ],
      },
    ],
  ],
  abraham: [
    [
      {
        title: "The Call - Question 1",
        description: "When God called Abraham to leave his home, what was his response?",
        hint: "He was already 75 years old",
        options: [
          { text: "Obeyed and went to the land God would show him", correct: true, points: 10 },
          { text: "Argued that he was too old", correct: false, points: 3 },
          { text: "Asked to think about it", correct: false, points: 0 },
        ],
      },
      {
        title: "The Call - Question 2",
        description: "What did God promise Abraham?",
        hint: "A great reward",
        options: [
          { text: "I will make you a great nation and bless you", correct: true, points: 10 },
          { text: "You will have all the riches of the earth", correct: false, points: 0 },
          { text: "You will never suffer again", correct: false, points: 0 },
        ],
      },
      {
        title: "The Call - Question 3",
        description: "How did Abraham's faith influence the Bible?",
        hint: "He is called the father of faith",
        options: [
          { text: "He became the father of all believers in God's promise", correct: true, points: 10 },
          { text: "He wrote the first five books of the Bible", correct: false, points: 0 },
          { text: "He invented the Hebrew language", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "Sacrifice Isaac - Question 1",
        description: "When God asked Abraham to sacrifice his only son Isaac, what did he do?",
        hint: "It was the ultimate test of faith",
        options: [
          { text: "Prepared to obey, trusting God completely", correct: true, points: 10 },
          { text: "Refused and questioned God", correct: false, points: 0 },
          { text: "Consulted with Sarah first", correct: false, points: 0 },
        ],
      },
      {
        title: "Sacrifice Isaac - Question 2",
        description: "What did Isaac ask Abraham on the way to Mount Moriah?",
        hint: "He noticed something was missing",
        options: [
          { text: "'Where is the lamb for the sacrifice?'", correct: true, points: 10 },
          { text: "'Why are you being so quiet, Father?'", correct: false, points: 0 },
          { text: "'Are we going to die today?'", correct: false, points: 0 },
        ],
      },
      {
        title: "Sacrifice Isaac - Question 3",
        description: "How did God stop Abraham from sacrificing Isaac?",
        hint: "An intervention at the last moment",
        options: [
          { text: "An angel stopped him and provided a ram", correct: true, points: 10 },
          { text: "Isaac ran away before the sacrifice", correct: false, points: 0 },
          { text: "God made Isaac disappear", correct: false, points: 0 },
        ],
      },
    ],
  ],
  job: [
    [
      {
        title: "Testing Begins - Question 1",
        description: "When all Job's possessions and children were taken, what did he do?",
        hint: "He showed remarkable faith",
        options: [
          { text: "Worshipped God and said the Lord gives and takes away", correct: true, points: 10 },
          { text: "Cursed God and died", correct: false, points: 0 },
          { text: "Sought revenge", correct: false, points: 0 },
        ],
      },
      {
        title: "Testing Begins - Question 2",
        description: "How did Job's wife respond to their suffering?",
        hint: "She was overwhelmed",
        options: [
          { text: "'Curse God and die'", correct: true, points: 10 },
          { text: "'Let's start over with God's help'", correct: false, points: 0 },
          { text: "'We must leave this place'", correct: false, points: 0 },
        ],
      },
      {
        title: "Testing Begins - Question 3",
        description: "What did Job's friends do when they heard of his troubles?",
        hint: "They came to support him",
        options: [
          { text: "Came and sat with him in silence for seven days", correct: true, points: 10 },
          { text: "Immediately criticized him for sinning", correct: false, points: 0 },
          { text: "Refused to acknowledge his suffering", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "In Suffering - Question 1",
        description: "When suffering with boils and loss, what did Job do?",
        hint: "He questioned but didn't abandon faith",
        options: [
          { text: "Questioned God but sought understanding", correct: true, points: 10 },
          { text: "Cursed the day he was born and gave up", correct: false, points: 0 },
          { text: "Accepted suffering without question", correct: false, points: 5 },
        ],
      },
      {
        title: "In Suffering - Question 2",
        description: "What did God challenge Job with?",
        hint: "God spoke from the whirlwind",
        options: [
          { text: "Questions about God's creation and power", correct: true, points: 10 },
          { text: "Promises of immediate restoration", correct: false, points: 0 },
          { text: "Explanations for all his pain", correct: false, points: 0 },
        ],
      },
      {
        title: "In Suffering - Question 3",
        description: "How did Job's story end?",
        hint: "God restored him",
        options: [
          { text: "God restored his health, wealth, and gave him new children", correct: true, points: 10 },
          { text: "He died in poverty and loneliness", correct: false, points: 0 },
          { text: "He became a wandering monk", correct: false, points: 0 },
        ],
      },
    ],
  ],
  esther: [
    [
      {
        title: "Hidden Identity - Question 1",
        description: "When Haman plotted to destroy all Jews, did Esther reveal her identity?",
        hint: "She risked everything",
        options: [
          { text: "Yes, she revealed herself to save her people", correct: true, points: 10 },
          { text: "No, she remained hidden", correct: false, points: 0 },
          { text: "She fled to another country", correct: false, points: 0 },
        ],
      },
      {
        title: "Hidden Identity - Question 2",
        description: "Who was Esther's cousin that helped raise her?",
        hint: "He served in the palace",
        options: [
          { text: "Mordecai", correct: true, points: 10 },
          { text: "Haman", correct: false, points: 0 },
          { text: "Ahasuerus", correct: false, points: 0 },
        ],
      },
      {
        title: "Hidden Identity - Question 3",
        description: "Why was Esther chosen to be queen?",
        hint: "She won a beauty contest",
        options: [
          { text: "She found favor and won a contest to replace the previous queen", correct: true, points: 10 },
          { text: "She was the king's childhood friend", correct: false, points: 0 },
          { text: "Her family was politically powerful", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "The Risk - Question 1",
        description: "Approaching the king without summons meant death. What did Esther say?",
        hint: "She showed courage",
        options: [
          { text: "'If I perish, I perish' - she risked her life", correct: true, points: 10 },
          { text: "She asked guards to announce her", correct: false, points: 0 },
          { text: "She waited for an invitation", correct: false, points: 2 },
        ],
      },
      {
        title: "The Risk - Question 2",
        description: "What did Esther do to prepare for this risky encounter?",
        hint: "Spiritual preparation",
        options: [
          { text: "Asked her people to fast and pray for her", correct: true, points: 10 },
          { text: "Put on her most beautiful dress", correct: false, points: 0 },
          { text: "Practiced her speech many times", correct: false, points: 0 },
        ],
      },
      {
        title: "The Risk - Question 3",
        description: "What was the result of Esther's courage?",
        hint: "Justice and salvation",
        options: [
          { text: "The king granted her request to save the Jews and punished Haman", correct: true, points: 10 },
          { text: "Esther was killed for her boldness", correct: false, points: 0 },
          { text: "The Jews had to flee the country", correct: false, points: 0 },
        ],
      },
    ],
  ],
  jonah: [
    [
      {
        title: "The Call to Nineveh - Question 1",
        description: "When God called Jonah to preach to Nineveh (Israel's enemy), what did he do?",
        hint: "He ran away",
        options: [
          { text: "Fled to Tarshish on a ship", correct: true, points: 0 },
          { text: "Immediately obeyed", correct: false, points: 10 },
          { text: "Prayed for strength", correct: false, points: 5 },
        ],
      },
      {
        title: "The Call to Nineveh - Question 2",
        description: "Why was Jonah reluctant to go to Nineveh?",
        hint: "They were enemies",
        options: [
          { text: "Nineveh was Israel's enemy and he didn't want to preach grace to them", correct: true, points: 10 },
          { text: "He was afraid of the sea", correct: false, points: 0 },
          { text: "He didn't believe God's message", correct: false, points: 0 },
        ],
      },
      {
        title: "The Call to Nineveh - Question 3",
        description: "What did God do to teach Jonah about running from him?",
        hint: "A storm occurred",
        options: [
          { text: "Sent a great storm that threatened to sink the ship", correct: true, points: 10 },
          { text: "Made Jonah instantly sick", correct: false, points: 0 },
          { text: "Dried up all the water routes", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "The Fish - Question 1",
        description: "After being thrown into the sea, what happened to Jonah?",
        hint: "A great fish swallowed him",
        options: [
          { text: "A fish swallowed him for three days and nights", correct: true, points: 10 },
          { text: "He swam to shore", correct: false, points: 0 },
          { text: "He drowned and was resurrected", correct: false, points: 0 },
        ],
      },
      {
        title: "The Fish - Question 2",
        description: "What did Jonah do inside the fish?",
        hint: "He prayed",
        options: [
          { text: "Prayed and repented before God", correct: true, points: 10 },
          { text: "Tried to escape by swimming", correct: false, points: 0 },
          { text: "Fell asleep and dreamed", correct: false, points: 0 },
        ],
      },
      {
        title: "The Fish - Question 3",
        description: "How did Jonah escape from the fish?",
        hint: "God had a plan",
        options: [
          { text: "God caused the fish to vomit him onto dry land", correct: true, points: 10 },
          { text: "He cut his way out with a sharp object", correct: false, points: 0 },
          { text: "The fish died and released him", correct: false, points: 0 },
        ],
      },
    ],
  ],
  moses: [
    [
      {
        title: "The Burning Bush - Question 1",
        description: "When God appeared in the burning bush, what did Moses do?",
        hint: "He was afraid",
        options: [
          { text: "Removed his sandals and spoke with God", correct: true, points: 10 },
          { text: "Ran away in fear", correct: false, points: 0 },
          { text: "Tried to extinguish the fire", correct: false, points: 0 },
        ],
      },
      {
        title: "The Burning Bush - Question 2",
        description: "What was Moses' first concern about God's calling?",
        hint: "He doubted himself",
        options: [
          { text: "'Who am I to speak for you?'", correct: true, points: 10 },
          { text: "'Will the people believe me?'", correct: false, points: 5 },
          { text: "'How will I find Pharaoh?'", correct: false, points: 0 },
        ],
      },
      {
        title: "The Burning Bush - Question 3",
        description: "What name did God reveal to Moses?",
        hint: "'I am who I am'",
        options: [
          { text: "The Great I AM - the eternal God", correct: true, points: 10 },
          { text: "The God of Abraham", correct: false, points: 5 },
          { text: "The Mighty One", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "Parting the Red Sea - Question 1",
        description: "When Pharaoh's army pursued the fleeing Israelites, what did Moses do?",
        hint: "The sea was their escape",
        options: [
          { text: "Raised his staff and God parted the waters", correct: true, points: 10 },
          { text: "Fought the Egyptian army", correct: false, points: 0 },
          { text: "Found an alternate route", correct: false, points: 0 },
        ],
      },
      {
        title: "Parting the Red Sea - Question 2",
        description: "How did the Israelites cross the sea?",
        hint: "On dry ground",
        options: [
          { text: "On dry ground with walls of water on each side", correct: true, points: 10 },
          { text: "In boats Moses provided", correct: false, points: 0 },
          { text: "By swimming across", correct: false, points: 0 },
        ],
      },
      {
        title: "Parting the Red Sea - Question 3",
        description: "What happened to Pharaoh's army?",
        hint: "The waters returned",
        options: [
          { text: "The waters returned and they were drowned", correct: true, points: 10 },
          { text: "They retreated back to Egypt", correct: false, points: 0 },
          { text: "They escaped and pursued Israel in the wilderness", correct: false, points: 0 },
        ],
      },
    ],
  ],
  stephen: [
    [
      {
        title: "Before the Sanhedrin - Question 1",
        description: "When accused of blasphemy, what did Stephen do?",
        hint: "He gave a powerful testimony",
        options: [
          { text: "Gave a speech reviewing God's history with Israel", correct: true, points: 10 },
          { text: "Denied the charges", correct: false, points: 3 },
          { text: "Asked for mercy", correct: false, points: 0 },
        ],
      },
      {
        title: "Before the Sanhedrin - Question 2",
        description: "What special characteristic did Stephen have?",
        hint: "He performed miracles",
        options: [
          { text: "He was full of faith and the Holy Spirit, doing great wonders", correct: true, points: 10 },
          { text: "He was the richest man in Jerusalem", correct: false, points: 0 },
          { text: "He was a chief priest of the temple", correct: false, points: 0 },
        ],
      },
      {
        title: "Before the Sanhedrin - Question 3",
        description: "What did Stephen claim to see in his final vision?",
        hint: "Jesus appeared",
        options: [
          { text: "Jesus standing at the right hand of God", correct: true, points: 10 },
          { text: "Angels surrounding the courtroom", correct: false, points: 0 },
          { text: "The kingdom of heaven opening", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "During Stoning - Question 1",
        description: "As stones were being cast at him, what did Stephen do?",
        hint: "He remained faithful to the end",
        options: [
          { text: "Saw a vision of Jesus and forgave his killers", correct: true, points: 10 },
          { text: "Cried out in pain", correct: false, points: 0 },
          { text: "Tried to escape", correct: false, points: 2 },
        ],
      },
      {
        title: "During Stoning - Question 2",
        description: "What did Stephen pray as he was dying?",
        hint: "He showed mercy",
        options: [
          { text: "'Lord, do not hold this sin against them'", correct: true, points: 10 },
          { text: "'Save me from this suffering'", correct: false, points: 0 },
          { text: "'Forgive me for my sins'", correct: false, points: 0 },
        ],
      },
      {
        title: "During Stoning - Question 3",
        description: "Who was present at Stephen's stoning?",
        hint: "A future apostle",
        options: [
          { text: "A young man named Saul who became Paul", correct: true, points: 10 },
          { text: "Peter and John", correct: false, points: 0 },
          { text: "James, the brother of Jesus", correct: false, points: 0 },
        ],
      },
    ],
  ],
  lydia: [
    [
      {
        title: "By the River - Question 1",
        description: "When Paul preached to women by the river, what was Lydia's response?",
        hint: "Her heart was opened by God",
        options: [
          { text: "God opened her heart and she believed and was baptized", correct: true, points: 10 },
          { text: "She listened but didn't believe", correct: false, points: 0 },
          { text: "She rejected Paul's message", correct: false, points: 0 },
        ],
      },
      {
        title: "By the River - Question 2",
        description: "What was Lydia's profession?",
        hint: "She was a merchant",
        options: [
          { text: "A seller of purple cloth", correct: true, points: 10 },
          { text: "A weaver of wool", correct: false, points: 0 },
          { text: "A silk trader", correct: false, points: 0 },
        ],
      },
      {
        title: "By the River - Question 3",
        description: "Where was Lydia from originally?",
        hint: "A city of purple trade",
        options: [
          { text: "Thyatira", correct: true, points: 10 },
          { text: "Corinth", correct: false, points: 0 },
          { text: "Antioch", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "Opening Her Home - Question 1",
        description: "After her conversion, what did Lydia do for Paul and his companions?",
        hint: "She was hospitable",
        options: [
          { text: "Invited them to stay in her home", correct: true, points: 10 },
          { text: "Gave them money and sent them away", correct: false, points: 0 },
          { text: "Pointed them to the local inn", correct: false, points: 0 },
        ],
      },
      {
        title: "Opening Her Home - Question 2",
        description: "What became the first church in Europe because of Lydia?",
        hint: "Where Paul was in prison",
        options: [
          { text: "The church at Philippi meeting in her house", correct: true, points: 10 },
          { text: "The church at Athens", correct: false, points: 0 },
          { text: "The church at Rome", correct: false, points: 0 },
        ],
      },
      {
        title: "Opening Her Home - Question 3",
        description: "How did Lydia demonstrate her faithfulness after conversion?",
        hint: "She gave generously",
        options: [
          { text: "She persistently urged Paul and his companions to stay with her", correct: true, points: 10 },
          { text: "She gave away all her possessions", correct: false, points: 0 },
          { text: "She traveled with Paul on his missionary journeys", correct: false, points: 0 },
        ],
      },
    ],
  ],
  timothy: [
    [
      {
        title: "Raised in Faith - Question 1",
        description: "Timothy was raised with faith by his mother and grandmother. What did Paul challenge him to do?",
        hint: "He was young and needed encouragement",
        options: [
          { text: "Not be ashamed but be bold in faith despite his youth", correct: true, points: 10 },
          { text: "Wait until he was older to lead", correct: false, points: 0 },
          { text: "Hide his faith from unbelievers", correct: false, points: 0 },
        ],
      },
      {
        title: "Raised in Faith - Question 2",
        description: "Who were Timothy's faithful family members?",
        hint: "The women in his life",
        options: [
          { text: "His mother Eunice and grandmother Lois", correct: true, points: 10 },
          { text: "His father was a believer too", correct: false, points: 0 },
          { text: "His siblings raised him", correct: false, points: 0 },
        ],
      },
      {
        title: "Raised in Faith - Question 3",
        description: "What did Paul say about Timothy's faith?",
        hint: "It was genuine",
        options: [
          { text: "His sincere faith dwelt first in his grandmother and mother, then in him", correct: true, points: 10 },
          { text: "He struggled with doubts his whole life", correct: false, points: 0 },
          { text: "He came to faith later in life", correct: false, points: 0 },
        ],
      },
    ],
    [
      {
        title: "Leading Ephesus - Question 1",
        description: "When Paul left Timothy to oversee the church in Ephesus, what did he encourage him to do?",
        hint: "There was false teaching to combat",
        options: [
          { text: "Command and teach sound doctrine", correct: true, points: 10 },
          { text: "Tolerate false teachers for unity", correct: false, points: 0 },
          { text: "Leave the problematic church", correct: false, points: 3 },
        ],
      },
      {
        title: "Leading Ephesus - Question 2",
        description: "What was Timothy's challenge in Ephesus?",
        hint: "Some were teaching heresy",
        options: [
          { text: "Charging people not to teach different doctrines", correct: true, points: 10 },
          { text: "Converting pagans to Christianity", correct: false, points: 0 },
          { text: "Building a larger church building", correct: false, points: 0 },
        ],
      },
      {
        title: "Leading Ephesus - Question 3",
        description: "What spiritual weapon did Paul encourage Timothy to use?",
        hint: "The written Word of God",
        options: [
          { text: "Devote himself to reading, exhortation, and doctrine", correct: true, points: 10 },
          { text: "Only preaching and speaking", correct: false, points: 0 },
          { text: "Performing miracles and signs", correct: false, points: 0 },
        ],
      },
    ],
  ],
};

function Intro({ onStart, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-primary via-primary to-accent/20 flex items-center justify-center p-4 z-50"
    >
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-white/60 hover:text-white transition-colors"
        title="Close game"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="text-center max-w-2xl">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-7xl mb-6"
        >
          📖
        </motion.div>
        <h1 className="font-display text-5xl font-bold text-white mb-4">The Disciples Conquest</h1>
        <p className="font-body text-xl text-white/80 mb-8">
          Walk in the footsteps of biblical heroes. Experience their journeys, their choices, and their faith. Test your knowledge of Scripture by predicting how each character responded to their greatest trials.
        </p>
        <p className="font-body text-sm text-white/60 mb-12">
          From Peter's denial to Paul's conversion, from David's courage to Esther's risk—discover what really happened.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-8 py-4 rounded-xl bg-accent text-accent-foreground font-body text-lg font-bold hover:bg-accent/90 transition-colors"
        >
          Begin Your Journey
        </motion.button>
      </div>
    </motion.div>
  );
}

function CharacterSelect({ onSelectCharacter, onBack, visitedPlaces, onResetPlaces }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-3xl font-bold text-white">Choose Your Biblical Character</h2>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      {visitedPlaces.length > 0 && (
        <button
          onClick={onResetPlaces}
          className="mb-3 px-3 py-1.5 rounded text-xs font-semibold text-accent hover:bg-accent/10 transition-colors"
        >
          Reset All Places
        </button>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto pr-2">
        {CHARACTERS.filter(char => !['jezebel', 'judas'].includes(char.id)).map((char) => (
          <motion.button
            key={char.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCharacter(char.id)}
            className="p-4 rounded-xl border-2 border-border bg-card hover:border-accent hover:bg-accent/5 transition-all text-center group"
          >
            <h3 className="font-display font-bold text-foreground mb-1 text-sm group-hover:text-white transition-colors">{char.name}</h3>
            <p className="font-body text-xs text-muted-foreground mb-2">{char.description}</p>
            <p className="font-body text-[10px] text-accent italic">{char.story}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function GameMap({ character, playerPos, onMove, visitedPlaces, score }) {
  const journey = CHARACTER_JOURNEYS[character] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-body text-xs text-muted-foreground mb-1">Score</p>
          <p className="font-display text-3xl font-bold text-accent">{score}</p>
        </div>
        <div className="text-right">
          <p className="font-body text-xs text-muted-foreground mb-1">Places Visited: {visitedPlaces.length}/{journey.length}</p>
          <div className="flex gap-1">
            {journey.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  visitedPlaces.includes(idx) ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-square rounded-2xl border-2 border-border bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-hidden shadow-inner">
        {/* Historical Map Background */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Sea/Water areas */}
          <rect x="0" y="0" width="15" height="100" fill="#A0C4E6" opacity="0.4" />
          <rect x="85" y="35" width="15" height="30" fill="#A0C4E6" opacity="0.4" />
          
          {/* Regional boundaries - Judea, Galilee, Samaria */}
          <g stroke="#8B6F47" strokeWidth="0.3" fill="none" strokeDasharray="1,0.5">
            {/* Judea outline */}
            <path d="M 25 50 L 35 45 L 40 55 L 35 65 L 25 68 Z" />
            {/* Galilee outline */}
            <path d="M 30 20 L 38 15 L 42 25 L 35 32 Z" />
            {/* Samaria outline */}
            <path d="M 28 35 L 36 32 L 38 42 L 32 46 Z" />
            {/* Dead Sea */}
            <rect x="38" y="48" width="4" height="25" fill="none" stroke="#4A90E2" strokeWidth="0.5" />
          </g>

          {/* Ancient roads/paths */}
          <g stroke="#D2B48C" strokeWidth="0.2" opacity="0.6">
            <line x1="20" y1="60" x2="35" y2="50" />
            <line x1="32" y1="25" x2="32" y2="50" />
            <line x1="25" y1="50" x2="50" y2="50" />
          </g>

          {/* Mountain ranges indicator */}
          <g fill="none" stroke="#8B7355" strokeWidth="0.2" opacity="0.5">
            <path d="M 22 40 L 24 35 L 26 40" />
            <path d="M 35 20 L 37 12 L 39 20" />
            <path d="M 45 55 L 47 48 L 49 55" />
          </g>
        </svg>

        {/* Region labels */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 font-body text-[10px] font-bold text-amber-900/40 whitespace-nowrap">GALILEE</div>
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 font-body text-[10px] font-bold text-amber-900/40 whitespace-nowrap">SAMARIA</div>
          <div className="absolute top-2/3 left-1/3 -translate-x-1/2 -translate-y-1/2 font-body text-[10px] font-bold text-amber-900/40 whitespace-nowrap">JUDEA</div>
          <div className="absolute top-3/4 right-1/4 -translate-x-1/2 -translate-y-1/2 font-body text-[9px] font-bold text-blue-700/40 whitespace-nowrap">Dead Sea</div>
          <div className="absolute top-1/3 left-0 -translate-y-1/2 font-body text-[9px] font-bold text-blue-700/40 whitespace-nowrap translate-x-1">Mediterranean</div>
        </div>
        <svg className="absolute inset-0 w-full h-full">
          {journey.map((place, idx) => (
            idx > 0 && (
              <line
                key={`line-${idx}`}
                x1={`${journey[idx - 1].x}%`}
                y1={`${journey[idx - 1].y}%`}
                x2={`${place.x}%`}
                y2={`${place.y}%`}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )
          ))}

          {journey.map((place, idx) => (
            <g
              key={place.place}
              onClick={() => onMove(idx)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <circle
                cx={`${place.x}%`}
                cy={`${place.y}%`}
                r="5"
                fill={visitedPlaces.includes(idx) ? "#FFD700" : "rgba(255, 255, 255, 0.2)"}
                stroke={visitedPlaces.includes(idx) ? "#FFD700" : "rgba(255, 255, 255, 0.4)"}
                strokeWidth="2"
              />
            </g>
          ))}

          <g>
            <circle
              cx={`${journey[playerPos]?.x || 50}%`}
              cy={`${journey[playerPos]?.y || 50}%`}
              r="4"
              fill="#FF6B6B"
              stroke="#FFF"
              strokeWidth="2"
            />
            <circle
              cx={`${journey[playerPos]?.x || 50}%`}
              cy={`${journey[playerPos]?.y || 50}%`}
              r="4"
              fill="none"
              stroke="#FF6B6B"
              strokeWidth="1"
              opacity="0.5"
            >
              <animate attributeName="r" from="4" to="8" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>

        {journey.map((place, idx) => (
          <div
            key={`label-${idx}`}
            style={{ left: `${place.x}%`, top: `${place.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="text-lg">{idx === 0 ? "📍" : "⭐"}</div>
            <div className="font-body text-[10px] font-bold text-white text-center bg-black/40 px-2 py-1 rounded whitespace-nowrap mt-1">
              {place.event}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {journey.map((place, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onMove(idx)}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              visitedPlaces.includes(idx)
                ? "border-accent bg-accent/10"
                : "border-border bg-card hover:border-accent hover:bg-accent/5"
            }`}
          >
            <p className="font-body text-xs text-muted-foreground mb-1">{place.place}</p>
            <p className="font-display text-sm font-bold text-foreground">{place.event}</p>
            {visitedPlaces.includes(idx) && (
              <p className="font-body text-xs text-accent mt-1">✓ Visited</p>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ScenarioModal({ scenario, character, onChoice, onClose, questionNumber, totalQuestions }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-card border-2 border-border rounded-2xl max-w-md max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{scenario.title}</h2>
            <p className="font-body text-xs text-muted-foreground mt-1">Question {questionNumber} of {totalQuestions}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-3">{scenario.description}</p>
        {scenario.hint && (
          <p className="font-body text-xs text-accent italic mb-4">💡 Hint: {scenario.hint}</p>
        )}

        <div className="space-y-3 mb-6">
          {scenario.options.map((option, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChoice(option)}
              className="w-full text-left p-4 rounded-xl border-2 border-border bg-secondary/30 hover:bg-secondary/60 hover:border-accent transition-all font-body text-sm"
            >
              <span className="font-semibold">{option.text}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DisciplesConquest({ user }) {
  const queryClient = useQueryClient();
  const [gameState, setGameState] = useState("intro");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [playerPos, setPlayerPos] = useState(0);
  const [score, setScore] = useState(0);
  const [visitedPlaces, setVisitedPlaces] = useState([0]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (finalScore) => {
      if (!user) return;
      const character = CHARACTERS.find((c) => c.id === selectedCharacter);
      await db.entities.GameScore.create({
        player_email: user.email,
        player_name: user.full_name,
        game_type: "disciples_conquest",
        score: finalScore,
        difficulty: character?.name || "biblical_hero",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-leaderboard"] });
    },
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (progressData) => {
      if (!user) return;
      const existing = await db.entities.GameProgress.filter({
        player_email: user.email,
        character_id: selectedCharacter,
      });
      if (existing.length > 0) {
        await db.entities.GameProgress.update(existing[0].id, progressData);
      } else {
        await db.entities.GameProgress.create({
          player_email: user.email,
          character_id: selectedCharacter,
          ...progressData,
        });
      }
    },
  });

  const loadProgressMutation = useMutation({
    mutationFn: async (charId) => {
      if (!user) return null;
      const progress = await db.entities.GameProgress.filter({
        player_email: user.email,
        character_id: charId,
      });
      return progress.length > 0 ? progress[0] : null;
    },
  });

  const journey = CHARACTER_JOURNEYS[selectedCharacter] || [];

  const handleMoveToPlace = (placeIdx) => {
    setPlayerPos(placeIdx);

    const newVisited = visitedPlaces.includes(placeIdx) ? visitedPlaces : [...visitedPlaces, placeIdx];
    setVisitedPlaces(newVisited);
    saveProgressMutation.mutate({
      visited_places: newVisited,
      player_pos: placeIdx,
      score,
    });

    const scenarioList = CHARACTER_SCENARIOS[selectedCharacter];
    if (scenarioList && scenarioList[placeIdx]) {
      setCurrentQuestionIdx(0);
      setActiveScenario(scenarioList[placeIdx]);
    }
  };

  const handleResetPlaces = async () => {
    if (!window.confirm("Reset all visited places? Your score will remain.")) return;
    setVisitedPlaces([0]);
    saveProgressMutation.mutate({
      visited_places: [0],
      player_pos: 0,
      score,
    });
  };

  const handleScenarioChoice = (option) => {
    const newScore = (option.correct || option.points > 0) ? option.points : 0;
    const updatedScore = score + newScore;
    setScore(updatedScore);
    
    const questionsForLocation = activeScenario;
    const isLastQuestion = currentQuestionIdx === questionsForLocation.length - 1;
    
    if (isLastQuestion) {
      setActiveScenario(null);
      setCurrentQuestionIdx(0);
      saveProgressMutation.mutate({
        visited_places: visitedPlaces,
        player_pos: playerPos,
        score: updatedScore,
      });
      
      if (visitedPlaces.length === journey.length) {
        saveMutation.mutate(updatedScore);
        setGameState("complete");
      }
    } else {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const handleReset = async () => {
    if (selectedCharacter && user) {
      const existing = await db.entities.GameProgress.filter({
        player_email: user.email,
        character_id: selectedCharacter,
      });
      if (existing.length > 0) {
        await db.entities.GameProgress.delete(existing[0].id);
      }
    }
    setGameState("intro");
    setSelectedCharacter(null);
    setPlayerPos(0);
    setScore(0);
    setVisitedPlaces([0]);
    setActiveScenario(null);
    setIsLoadingProgress(false);
  };

  if (gameState === "intro") {
    return <Intro onStart={() => setGameState("character")} onClose={handleReset} />;
  }

  if (gameState === "character") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-accent/20 p-8 rounded-2xl">
        <CharacterSelect
          onSelectCharacter={async (charId) => {
            setSelectedCharacter(charId);
            setIsLoadingProgress(true);
            const progress = await loadProgressMutation.mutateAsync(charId);
            if (progress) {
              setPlayerPos(progress.player_pos || 0);
              setScore(progress.score || 0);
              setVisitedPlaces(progress.visited_places || [0]);
            } else {
              setPlayerPos(0);
              setScore(0);
              setVisitedPlaces([0]);
            }
            setIsLoadingProgress(false);
            setGameState("game");
          }}
          onBack={() => setGameState("intro")}
          visitedPlaces={visitedPlaces}
          onResetPlaces={handleResetPlaces}
        />
      </div>
    );
  }

  if (gameState === "complete") {
    const character = CHARACTERS.find((c) => c.id === selectedCharacter);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border-2 border-accent bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 p-8 text-center"
      >
        <div className="mb-4">
          <span className="text-6xl">{character?.emoji}</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">Journey Complete</h2>
        <p className="font-body text-muted-foreground mb-6">
          You walked the path of {character?.name} and tested your biblical knowledge.
        </p>
        <div className="p-6 rounded-xl bg-accent/10 border-2 border-accent mb-6">
          <p className="font-body text-sm text-muted-foreground mb-1">Final Score</p>
          <p className="font-display text-5xl font-bold text-accent">{score}</p>
        </div>
        <button
          onClick={() => {
            saveProgressMutation.mutate({
              visited_places: visitedPlaces,
              player_pos: playerPos,
              score,
            });
            handleReset();
          }}
          className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-body font-semibold hover:bg-accent/90 transition-colors"
        >
          Choose Another Hero
        </button>
      </motion.div>
    );
  }

  const character = CHARACTERS.find((c) => c.id === selectedCharacter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">The Disciples Conquest</h1>
          <p className="font-body text-sm text-muted-foreground flex items-center gap-2 mt-1">
            {character?.emoji} {character?.name}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Menu
        </button>
      </div>

      <GameMap
        character={selectedCharacter}
        playerPos={playerPos}
        onMove={handleMoveToPlace}
        visitedPlaces={visitedPlaces}
        score={score}
      />

      <AnimatePresence>
        {activeScenario && (
          <ScenarioModal 
            scenario={activeScenario[currentQuestionIdx]}
            character={selectedCharacter} 
            onChoice={handleScenarioChoice}
            onClose={() => setActiveScenario(null)}
            questionNumber={currentQuestionIdx + 1}
            totalQuestions={activeScenario.length}
          />
        )}
      </AnimatePresence>
    </div>
  );
}