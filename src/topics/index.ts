import { DiagramLesson, LearnerLevel, LevelConfig, TopicPack } from '../types';

export const LEARNER_LEVELS: LevelConfig[] = [
  {
    id: 'little',
    label: 'Little learner',
    ageRange: '6-10',
    description: 'Fun, story-driven explanations with playful analogies like toy trains and mailboxes.',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'student',
    label: 'Student',
    ageRange: '11-17',
    description: 'Clear, engaging concepts with real-world tech examples and foundational terms.',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    ageRange: '18+',
    description: 'In-depth protocols, packet headers, routing algorithms, and architectural depth.',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

export const STARTER_TOPICS = [
  'How data travels over a network',
  'What is an IP address',
  'What does a router do',
  'How DNS works',
  'TCP vs UDP',
  'How the internet reaches my phone',
  'What is Wi-Fi',
  'What is a firewall'
];

export const NETWORKING_PACK: TopicPack = {
  id: 'networking',
  name: 'Computer Networking',
  description: 'Understand the invisible digital highway connecting every computer on Earth.',
  iconName: 'Network',
  topics: [
    {
      id: 'data-travel',
      title: 'How data travels over a network',
      summary: 'Data is broken into tiny digital envelopes called packets that zoom across cables and airwaves.',
      category: 'Fundamentals'
    },
    {
      id: 'ip-address',
      title: 'What is an IP address',
      summary: 'Your device’s unique mailing address on the global internet city.',
      category: 'Addressing'
    },
    {
      id: 'router-function',
      title: 'What does a router do',
      summary: 'The intelligent traffic cop and sorting hub directing packets to the fastest path.',
      category: 'Routing'
    },
    {
      id: 'dns-works',
      title: 'How DNS works',
      summary: 'The internet’s giant contacts list turning names like google.com into numbers.',
      category: 'Protocols'
    },
    {
      id: 'tcp-vs-udp',
      title: 'TCP vs UDP',
      summary: 'The careful registered delivery truck versus the ultra-fast video live stream.',
      category: 'Transport'
    },
    {
      id: 'internet-phone',
      title: 'How the internet reaches my phone',
      summary: 'From undersea fiber cables to cellular towers and Wi-Fi waves inside your hand.',
      category: 'Wireless'
    },
    {
      id: 'what-is-wifi',
      title: 'What is Wi-Fi',
      summary: 'Invisible radio waves carrying binary Morse code through the air in your room.',
      category: 'Wireless'
    },
    {
      id: 'what-is-firewall',
      title: 'What is a firewall',
      summary: 'A vigilant security bouncer inspecting every envelope before letting it into your house.',
      category: 'Security'
    }
  ]
};

// Fallback / pre-computed high quality interactive lessons
export const CURATED_LESSONS: Record<string, Record<LearnerLevel, { explanation: string; analogy: string; diagram: DiagramLesson }>> = {
  'What does a router do': {
    little: {
      explanation: 'A router is like a magical mail sorting room for computers! When your laptop wants to show you a cat picture, it puts the message into tiny envelopes. The router looks at the address label on each envelope and sends it out onto the best road so it reaches the picture server without getting lost.',
      analogy: 'Imagine your toy neighborhood has a post office worker who knows every street shortcut and passes your letter from bike to train until it arrives.',
      diagram: {
        id: 'curated-router-little',
        title: 'How a Router Directs Your Cat Picture',
        topic: 'What does a router do',
        level: 'little',
        summary: 'Follow an envelope from your laptop to the friendly router and out to the cloud.',
        analogy: 'Post office sorting table',
        steps: [
          {
            stepNumber: 1,
            title: 'Your laptop writes a letter',
            caption: 'Your laptop makes a digital envelope asking for a cute cat video.',
            narration: 'Your laptop makes a digital envelope asking for a cute cat video.',
            highlightElementIds: ['laptop-1', 'packet-1'],
            elements: [
              { id: 'laptop-1', type: 'computer', x: 80, y: 220, label: 'Your Laptop', sublabel: 'Sender', status: 'active' },
              { id: 'cable-1', type: 'cable', x: 180, y: 250, fromId: 'laptop-1', toId: 'router-1' },
              { id: 'router-1', type: 'router', x: 360, y: 210, label: 'Home Router', sublabel: 'Mail Sorter' },
              { id: 'cable-2', type: 'cable', x: 460, y: 250, fromId: 'router-1', toId: 'cloud-1' },
              { id: 'cloud-1', type: 'cloud', x: 640, y: 210, label: 'The Internet', sublabel: 'Huge Network' },
              { id: 'packet-1', type: 'packet', x: 160, y: 235, label: 'Cat Request', status: 'transmitting' }
            ],
            packet: { fromId: 'laptop-1', toId: 'router-1', payload: 'Cat Video Request', progress: 0.2, status: 'moving' }
          },
          {
            stepNumber: 2,
            title: 'The router checks the address',
            caption: 'The router reads the label: "Deliver to Cat Video Server". It picks the fastest street!',
            narration: 'The router reads the label: Deliver to Cat Video Server. It picks the fastest street!',
            highlightElementIds: ['router-1', 'packet-1'],
            elements: [
              { id: 'laptop-1', type: 'computer', x: 80, y: 220, label: 'Your Laptop' },
              { id: 'cable-1', type: 'cable', x: 180, y: 250, fromId: 'laptop-1', toId: 'router-1' },
              { id: 'router-1', type: 'router', x: 360, y: 210, label: 'Home Router', sublabel: 'Checking Map...', status: 'active' },
              { id: 'cable-2', type: 'cable', x: 460, y: 250, fromId: 'router-1', toId: 'cloud-1' },
              { id: 'cloud-1', type: 'cloud', x: 640, y: 210, label: 'The Internet' },
              { id: 'packet-1', type: 'packet', x: 375, y: 170, label: 'Inspecting...', status: 'active' }
            ],
            packet: { fromId: 'laptop-1', toId: 'router-1', payload: 'Cat Video Request', progress: 1.0, status: 'inspected' }
          },
          {
            stepNumber: 3,
            title: 'Sent out across the world',
            caption: 'Zoom! The router forwards the envelope across the internet cables to fetch the video.',
            narration: 'Zoom! The router forwards the envelope across the internet cables to fetch the video.',
            highlightElementIds: ['cloud-1', 'packet-1'],
            elements: [
              { id: 'laptop-1', type: 'computer', x: 80, y: 220, label: 'Your Laptop' },
              { id: 'cable-1', type: 'cable', x: 180, y: 250, fromId: 'laptop-1', toId: 'router-1' },
              { id: 'router-1', type: 'router', x: 360, y: 210, label: 'Home Router', status: 'success' },
              { id: 'cable-2', type: 'cable', x: 460, y: 250, fromId: 'router-1', toId: 'cloud-1' },
              { id: 'cloud-1', type: 'cloud', x: 640, y: 210, label: 'The Internet', status: 'active' },
              { id: 'packet-1', type: 'packet', x: 550, y: 235, label: 'En Route', status: 'transmitting' }
            ],
            packet: { fromId: 'router-1', toId: 'cloud-1', payload: 'Delivering...', progress: 0.7, status: 'moving' }
          }
        ]
      }
    },
    student: {
      explanation: 'A router is a specialized networking computer that joins two or more networks together—usually your home Local Area Network (LAN) and the global Wide Area Network (WAN). It reads destination IP addresses in data packet headers and checks its internal routing table to determine the optimal hop.',
      analogy: 'A router acts like a postal dispatch center: it examines the zip code on every outgoing parcel and hands it to the correct carrier truck.',
      diagram: {
        id: 'curated-router-student',
        title: 'Packet Forwarding and NAT in a Home Router',
        topic: 'What does a router do',
        level: 'student',
        summary: 'Examine how local private IPs get translated and routed to the public internet.',
        analogy: 'Postal dispatch hub with address translation',
        steps: [
          {
            stepNumber: 1,
            title: 'Client generates outbound packet',
            caption: 'A laptop on LAN (192.168.1.5) sends an HTTP GET request packet destined for 142.250.190.46.',
            narration: 'A laptop on the local network sends an HTTP request packet destined for a remote web server.',
            highlightElementIds: ['laptop-1', 'packet-1'],
            elements: [
              { id: 'laptop-1', type: 'computer', x: 80, y: 200, label: 'Client PC', sublabel: '192.168.1.5', status: 'active' },
              { id: 'phone-1', type: 'phone', x: 80, y: 340, label: 'Phone', sublabel: '192.168.1.9' },
              { id: 'cable-1', type: 'cable', x: 180, y: 230, fromId: 'laptop-1', toId: 'switch-1' },
              { id: 'cable-p', type: 'cable', x: 180, y: 320, fromId: 'phone-1', toId: 'switch-1' },
              { id: 'switch-1', type: 'switch', x: 260, y: 250, label: 'LAN Switch', sublabel: 'Local Hub' },
              { id: 'cable-sw', type: 'cable', x: 360, y: 250, fromId: 'switch-1', toId: 'router-1' },
              { id: 'router-1', type: 'router', x: 440, y: 220, label: 'Router (NAT/Gateway)', sublabel: '192.168.1.1 / Public IP' },
              { id: 'cable-wan', type: 'cable', x: 550, y: 250, fromId: 'router-1', toId: 'cloud-1' },
              { id: 'cloud-1', type: 'cloud', x: 670, y: 210, label: 'Internet (WAN)', sublabel: 'BGP Backbones' },
              { id: 'packet-1', type: 'packet', x: 170, y: 225, label: 'Src: .1.5', status: 'transmitting' }
            ],
            packet: { fromId: 'laptop-1', toId: 'switch-1', payload: 'TCP SYN :80', progress: 0.5, status: 'moving' }
          },
          {
            stepNumber: 2,
            title: 'Router performs NAT & routing table lookup',
            caption: 'Network Address Translation (NAT) swaps the private IP for the public IP and records the socket in its state table.',
            narration: 'The router performs Network Address Translation, mapping the private IP to its single public IP address.',
            highlightElementIds: ['router-1', 'packet-1'],
            elements: [
              { id: 'laptop-1', type: 'computer', x: 80, y: 200, label: 'Client PC', sublabel: '192.168.1.5' },
              { id: 'phone-1', type: 'phone', x: 80, y: 340, label: 'Phone', sublabel: '192.168.1.9' },
              { id: 'cable-1', type: 'cable', x: 180, y: 230, fromId: 'laptop-1', toId: 'switch-1' },
              { id: 'cable-p', type: 'cable', x: 180, y: 320, fromId: 'phone-1', toId: 'switch-1' },
              { id: 'switch-1', type: 'switch', x: 260, y: 250, label: 'LAN Switch' },
              { id: 'cable-sw', type: 'cable', x: 360, y: 250, fromId: 'switch-1', toId: 'router-1' },
              { id: 'router-1', type: 'router', x: 440, y: 220, label: 'Router (NAT/Gateway)', sublabel: 'Table: .1.5:4920 -> Pub:52110', status: 'active' },
              { id: 'cable-wan', type: 'cable', x: 550, y: 250, fromId: 'router-1', toId: 'cloud-1' },
              { id: 'cloud-1', type: 'cloud', x: 670, y: 210, label: 'Internet (WAN)' },
              { id: 'packet-1', type: 'packet', x: 455, y: 175, label: 'NAT Translated', status: 'active' }
            ],
            packet: { fromId: 'switch-1', toId: 'router-1', payload: 'NAT Lookup', progress: 1.0, status: 'inspected' }
          },
          {
            stepNumber: 3,
            title: 'Forwarding to next-hop ISP gateway',
            caption: 'The packet leaves through the WAN interface to the ISP default gateway heading to the destination server.',
            narration: 'The packet leaves through the WAN interface towards the internet server.',
            highlightElementIds: ['cloud-1', 'packet-1'],
            elements: [
              { id: 'laptop-1', type: 'computer', x: 80, y: 200, label: 'Client PC' },
              { id: 'phone-1', type: 'phone', x: 80, y: 340, label: 'Phone' },
              { id: 'cable-1', type: 'cable', x: 180, y: 230, fromId: 'laptop-1', toId: 'switch-1' },
              { id: 'cable-p', type: 'cable', x: 180, y: 320, fromId: 'phone-1', toId: 'switch-1' },
              { id: 'switch-1', type: 'switch', x: 260, y: 250, label: 'LAN Switch' },
              { id: 'cable-sw', type: 'cable', x: 360, y: 250, fromId: 'switch-1', toId: 'router-1' },
              { id: 'router-1', type: 'router', x: 440, y: 220, label: 'Router (NAT/Gateway)', status: 'success' },
              { id: 'cable-wan', type: 'cable', x: 550, y: 250, fromId: 'router-1', toId: 'cloud-1' },
              { id: 'cloud-1', type: 'cloud', x: 670, y: 210, label: 'Internet (WAN)', status: 'active' },
              { id: 'packet-1', type: 'packet', x: 570, y: 240, label: 'Dst: 142.250...', status: 'transmitting' }
            ],
            packet: { fromId: 'router-1', toId: 'cloud-1', payload: 'To Web Server', progress: 0.6, status: 'moving' }
          }
        ]
      }
    },
    advanced: {
      explanation: 'Operating at Layer 3 (Network Layer) of the OSI model, a router parses IPv4/IPv6 packet headers, inspects the destination address, performs longest prefix match lookups in its Forwarding Information Base (FIB), decrements TTL, recomputes IP checksums, and forwards frames out the egress interface via ARP/MAC encapsulation.',
      analogy: 'An air traffic control node dynamically rerouting transcontinental flight corridors based on weather, runway availability, and shortest congestion-free vectors.',
      diagram: {
        id: 'curated-router-adv',
        title: 'OSI Layer 3 Packet Forwarding & Routing Protocol Convergence',
        topic: 'What does a router do',
        level: 'advanced',
        summary: 'Observe L2 frame decapsulation, FIB prefix matching, TTL decrement, and egress L2 re-encapsulation.',
        analogy: 'High-speed automated airline luggage conveyor with transponder rewrite',
        steps: [
          {
            stepNumber: 1,
            title: 'L2 Frame Arrival & Decapsulation',
            caption: 'The router receives an Ethernet frame on eth0. It verifies FCS, strips the L2 header, and extracts the IPv4 packet.',
            narration: 'The router receives an Ethernet frame, verifies the frame check sequence, and extracts the Layer 3 IP packet.',
            highlightElementIds: ['router-1', 'packet-1'],
            elements: [
              { id: 'laptop-1', type: 'computer', x: 80, y: 220, label: 'Host eth0', sublabel: '10.0.0.42/24' },
              { id: 'cable-1', type: 'cable', x: 200, y: 250, fromId: 'laptop-1', toId: 'router-1' },
              { id: 'router-1', type: 'router', x: 380, y: 200, label: 'Core L3 Router', sublabel: 'AS65001 / BGP / OSPF', status: 'active' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'router-1', toId: 'server-1' },
              { id: 'server-1', type: 'server', x: 680, y: 200, label: 'Remote Edge Host', sublabel: '198.51.100.1/32' },
              { id: 'packet-1', type: 'packet', x: 280, y: 235, label: 'L3: IP pkt', status: 'transmitting' }
            ],
            packet: { fromId: 'laptop-1', toId: 'router-1', payload: 'IPv4: TTL=64', progress: 0.8, status: 'moving' }
          },
          {
            stepNumber: 2,
            title: 'FIB Longest Prefix Match & TTL Decrement',
            caption: 'Router runs hardware Trie lookup against FIB (198.51.100.0/24 via eth1), decrements TTL to 63, and updates header checksum.',
            narration: 'The router matches the destination prefix in hardware FIB, decrements Time to Live, and determines the egress interface.',
            highlightElementIds: ['router-1', 'packet-1'],
            elements: [
              { id: 'laptop-1', type: 'computer', x: 80, y: 220, label: 'Host eth0' },
              { id: 'cable-1', type: 'cable', x: 200, y: 250, fromId: 'laptop-1', toId: 'router-1' },
              { id: 'router-1', type: 'router', x: 380, y: 200, label: 'Core L3 Router', sublabel: 'FIB: 198.51.100.0/24 -> eth1 (TTL 64->63)', status: 'active' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'router-1', toId: 'server-1' },
              { id: 'server-1', type: 'server', x: 680, y: 200, label: 'Remote Edge Host' },
              { id: 'packet-1', type: 'packet', x: 395, y: 150, label: 'TTL: 63', status: 'active' }
            ],
            packet: { fromId: 'laptop-1', toId: 'router-1', payload: 'TTL=63 Checksum', progress: 1.0, status: 'inspected' }
          },
          {
            stepNumber: 3,
            title: 'L2 Re-encapsulation & Next-Hop Egress',
            caption: 'Resolves next-hop MAC via ARP table cache, prepends new Ethernet 802.3 framing, and transmits frame out eth1.',
            narration: 'Prepending a new Layer 2 Ethernet frame with the next-hop MAC address, the packet is transmitted on the wire.',
            highlightElementIds: ['server-1', 'packet-1'],
            elements: [
              { id: 'laptop-1', type: 'computer', x: 80, y: 220, label: 'Host eth0' },
              { id: 'cable-1', type: 'cable', x: 200, y: 250, fromId: 'laptop-1', toId: 'router-1' },
              { id: 'router-1', type: 'router', x: 380, y: 200, label: 'Core L3 Router', status: 'success' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'router-1', toId: 'server-1' },
              { id: 'server-1', type: 'server', x: 680, y: 200, label: 'Remote Edge Host', status: 'active' },
              { id: 'packet-1', type: 'packet', x: 560, y: 235, label: 'Egress eth1', status: 'transmitting' }
            ],
            packet: { fromId: 'router-1', toId: 'server-1', payload: 'Frame Transmitted', progress: 0.7, status: 'moving' }
          }
        ]
      }
    }
  },
  'What is a firewall': {
    little: {
      explanation: 'A firewall is like a smart castle guard at your gate! When friends send you letters, the guard checks them. If a sneaky bad monster tries to slip in something dangerous, the firewall guard stops it right at the gate and shouts "You cannot come in!"',
      analogy: 'Like a security bouncer at a club checking tickets and keeping troublemakers outside the door.',
      diagram: {
        id: 'curated-firewall-little',
        title: 'The Firewall Castle Guard',
        topic: 'What is a firewall',
        level: 'little',
        summary: 'Safe packets are welcomed inside while bad packets are stopped at the wall.',
        analogy: 'Castle gatekeeper with a magic shield',
        steps: [
          {
            stepNumber: 1,
            title: 'Friendly message arrives',
            caption: 'A friendly message from your grandma arrives at your house.',
            narration: 'A friendly message from your grandma arrives at your house.',
            highlightElementIds: ['packet-friendly', 'cloud-1'],
            elements: [
              { id: 'cloud-1', type: 'cloud', x: 100, y: 220, label: 'The Outside Web', sublabel: 'Internet' },
              { id: 'cable-1', type: 'cable', x: 250, y: 250, fromId: 'cloud-1', toId: 'firewall-1' },
              { id: 'firewall-1', type: 'firewall', x: 380, y: 190, label: 'Firewall Guard', sublabel: 'Inspecting...' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'firewall-1', toId: 'laptop-1' },
              { id: 'laptop-1', type: 'computer', x: 670, y: 220, label: 'Your Computer', sublabel: 'Safe Inside' },
              { id: 'packet-friendly', type: 'packet', x: 230, y: 235, label: 'Grandma Letter', status: 'transmitting' }
            ],
            packet: { fromId: 'cloud-1', toId: 'firewall-1', payload: 'Safe Grandma Note', progress: 0.5, status: 'moving' }
          },
          {
            stepNumber: 2,
            title: 'The firewall says: Welcome!',
            caption: 'The firewall checks the badge. It says "Grandma: Safe". The guard lets it pass through!',
            narration: 'The firewall checks the badge, sees it is safe, and lets it through.',
            highlightElementIds: ['firewall-1', 'packet-friendly'],
            elements: [
              { id: 'cloud-1', type: 'cloud', x: 100, y: 220, label: 'The Outside Web' },
              { id: 'cable-1', type: 'cable', x: 250, y: 250, fromId: 'cloud-1', toId: 'firewall-1' },
              { id: 'firewall-1', type: 'firewall', x: 380, y: 190, label: 'Firewall Guard', sublabel: 'Allowed!', status: 'success' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'firewall-1', toId: 'laptop-1' },
              { id: 'laptop-1', type: 'computer', x: 670, y: 220, label: 'Your Computer', status: 'active' },
              { id: 'packet-friendly', type: 'packet', x: 540, y: 235, label: 'Safe Delivery', status: 'success' }
            ],
            packet: { fromId: 'firewall-1', toId: 'laptop-1', payload: 'Passed Firewall', progress: 0.7, status: 'delivered' }
          },
          {
            stepNumber: 3,
            title: 'A sneaky virus packet is BLOCKED!',
            caption: 'Oh no! An unknown bad packet tries to enter. The firewall flares red and BLOCKS it completely!',
            narration: 'An unknown bad packet tries to enter. The firewall flares red and blocks it completely!',
            highlightElementIds: ['firewall-1', 'packet-bad'],
            elements: [
              { id: 'cloud-1', type: 'cloud', x: 100, y: 220, label: 'The Outside Web' },
              { id: 'cable-1', type: 'cable', x: 250, y: 250, fromId: 'cloud-1', toId: 'firewall-1' },
              { id: 'firewall-1', type: 'firewall', x: 380, y: 190, label: 'Firewall Guard', sublabel: 'BLOCKED DANGER!', status: 'blocked' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'firewall-1', toId: 'laptop-1' },
              { id: 'laptop-1', type: 'computer', x: 670, y: 220, label: 'Your Computer', status: 'normal' },
              { id: 'packet-bad', type: 'packet', x: 375, y: 235, label: 'Blocked Virus', status: 'blocked' }
            ],
            packet: { fromId: 'cloud-1', toId: 'firewall-1', payload: 'Malicious Request', progress: 0.95, status: 'blocked' }
          }
        ]
      }
    },
    student: {
      explanation: 'A firewall monitors and filters incoming and outgoing network traffic based on an organization’s previously established security policies. It creates a barrier between a trusted internal network and untrusted external networks, examining IP addresses, port numbers, and protocol types.',
      analogy: 'Airport security checkpoint where travelers show their boarding pass and passport, and luggage passes through an X-ray scanner before boarding.',
      diagram: {
        id: 'curated-firewall-student',
        title: 'Packet Filtering and Port Inspection Rules',
        topic: 'What is a firewall',
        level: 'student',
        summary: 'Stateful inspection of incoming TCP traffic: Port 443 (HTTPS) allowed, Port 23 (Telnet) dropped.',
        analogy: 'Airport security checkpoint with passport verification',
        steps: [
          {
            stepNumber: 1,
            title: 'HTTPS Traffic on Port 443',
            caption: 'Encrypted web response on port 443 arrives from a trusted web server.',
            narration: 'An encrypted HTTPS packet arrives on port 443.',
            highlightElementIds: ['cloud-1', 'packet-1'],
            elements: [
              { id: 'cloud-1', type: 'cloud', x: 100, y: 220, label: 'Internet', sublabel: 'Remote Web' },
              { id: 'cable-1', type: 'cable', x: 250, y: 250, fromId: 'cloud-1', toId: 'firewall-1' },
              { id: 'firewall-1', type: 'firewall', x: 380, y: 200, label: 'Stateful Firewall', sublabel: 'Ruleset: ALLOW :443, DROP :23' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'firewall-1', toId: 'server-1' },
              { id: 'server-1', type: 'server', x: 680, y: 210, label: 'Internal Server', sublabel: 'Corporate LAN' },
              { id: 'packet-1', type: 'packet', x: 240, y: 235, label: 'TCP :443', status: 'transmitting' }
            ],
            packet: { fromId: 'cloud-1', toId: 'firewall-1', payload: 'HTTPS :443', progress: 0.4, status: 'moving' }
          },
          {
            stepNumber: 2,
            title: 'State table lookup permits packet',
            caption: 'Rule matches ALLOW. The firewall creates a state entry and forwards the packet to the internal server.',
            narration: 'The packet matches the allow rule and passes safely to the internal server.',
            highlightElementIds: ['firewall-1', 'server-1', 'packet-1'],
            elements: [
              { id: 'cloud-1', type: 'cloud', x: 100, y: 220, label: 'Internet' },
              { id: 'cable-1', type: 'cable', x: 250, y: 250, fromId: 'cloud-1', toId: 'firewall-1' },
              { id: 'firewall-1', type: 'firewall', x: 380, y: 200, label: 'Stateful Firewall', status: 'success' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'firewall-1', toId: 'server-1' },
              { id: 'server-1', type: 'server', x: 680, y: 210, label: 'Internal Server', status: 'active' },
              { id: 'packet-1', type: 'packet', x: 560, y: 235, label: 'Delivered :443', status: 'success' }
            ],
            packet: { fromId: 'firewall-1', toId: 'server-1', payload: 'Delivered', progress: 0.8, status: 'delivered' }
          },
          {
            stepNumber: 3,
            title: 'Unauthorized Port 23 probe DROPPED',
            caption: 'An external port scan attempts a Telnet connection (Port 23). The firewall rule drops the packet silently.',
            narration: 'An unauthorized port 23 scan is blocked and dropped at the firewall.',
            highlightElementIds: ['firewall-1', 'packet-bad'],
            elements: [
              { id: 'cloud-1', type: 'cloud', x: 100, y: 220, label: 'Internet' },
              { id: 'cable-1', type: 'cable', x: 250, y: 250, fromId: 'cloud-1', toId: 'firewall-1' },
              { id: 'firewall-1', type: 'firewall', x: 380, y: 200, label: 'Stateful Firewall', sublabel: 'DENY Port 23', status: 'blocked' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'firewall-1', toId: 'server-1' },
              { id: 'server-1', type: 'server', x: 680, y: 210, label: 'Internal Server' },
              { id: 'packet-bad', type: 'packet', x: 375, y: 235, label: 'SYN :23 BLOCKED', status: 'blocked' }
            ],
            packet: { fromId: 'cloud-1', toId: 'firewall-1', payload: 'Telnet Probe', progress: 0.95, status: 'blocked' }
          }
        ]
      }
    },
    advanced: {
      explanation: 'Modern enterprise Next-Generation Firewalls (NGFW) combine Layer 4 stateful packet filtering with deep packet inspection (DPI), TLS decryption, application identification (App-ID), and intrusion prevention systems (IPS) to detect zero-day exploits, protocol anomalies, and exfiltration attempts.',
      analogy: 'A forensic laboratory stationed at a border crossing performing chemical analysis, biometric scans, and manifest audits on every incoming container.',
      diagram: {
        id: 'curated-firewall-adv',
        title: 'Deep Packet Inspection & Stateful Inspection Engine',
        topic: 'What is a firewall',
        level: 'advanced',
        summary: 'Layer 7 application signature analysis, state tracking, and policy enforcement pipeline.',
        analogy: 'High-security cleanroom airlock with biometric and particle inspection',
        steps: [
          {
            stepNumber: 1,
            title: 'TCP 3-Way Handshake SYN Packet',
            caption: 'Inbound TCP SYN packet evaluated against connection tracking table (conntrack). New session state allocated.',
            narration: 'The firewall tracks the TCP three-way handshake and checks session state.',
            highlightElementIds: ['firewall-1', 'packet-1'],
            elements: [
              { id: 'cloud-1', type: 'cloud', x: 100, y: 220, label: 'External WAN', sublabel: '203.0.113.10' },
              { id: 'cable-1', type: 'cable', x: 250, y: 250, fromId: 'cloud-1', toId: 'firewall-1' },
              { id: 'firewall-1', type: 'firewall', x: 380, y: 190, label: 'NGFW / IPS Engine', sublabel: 'Conntrack: NEW_SYN', status: 'active' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'firewall-1', toId: 'server-1' },
              { id: 'server-1', type: 'server', x: 680, y: 210, label: 'App Cluster', sublabel: '10.240.0.10:443' },
              { id: 'packet-1', type: 'packet', x: 240, y: 235, label: 'TCP SYN', status: 'transmitting' }
            ],
            packet: { fromId: 'cloud-1', toId: 'firewall-1', payload: 'TCP SYN Seq=100', progress: 0.5, status: 'moving' }
          },
          {
            stepNumber: 2,
            title: 'L7 Deep Packet Inspection & Signature Matching',
            caption: 'Payload parsed for HTTP headers, SNI hostnames, and known CVE exploit signatures. Signature clean.',
            narration: 'Layer 7 deep packet inspection validates application signatures and protocol adherence.',
            highlightElementIds: ['firewall-1', 'packet-1'],
            elements: [
              { id: 'cloud-1', type: 'cloud', x: 100, y: 220, label: 'External WAN' },
              { id: 'cable-1', type: 'cable', x: 250, y: 250, fromId: 'cloud-1', toId: 'firewall-1' },
              { id: 'firewall-1', type: 'firewall', x: 380, y: 190, label: 'NGFW / IPS Engine', sublabel: 'App-ID: SSL/TLS Clean', status: 'success' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'firewall-1', toId: 'server-1' },
              { id: 'server-1', type: 'server', x: 680, y: 210, label: 'App Cluster' },
              { id: 'packet-1', type: 'packet', x: 395, y: 140, label: 'ESTABLISHED', status: 'success' }
            ],
            packet: { fromId: 'cloud-1', toId: 'firewall-1', payload: 'Clean Payload', progress: 1.0, status: 'inspected' }
          },
          {
            stepNumber: 3,
            title: 'Malicious SQL Injection Attempt Dropped & Logged',
            caption: 'A subsequent packet contains a SQL injection signature. The IPS engine drops the packet and transmits TCP RST.',
            narration: 'A malicious SQL injection payload is identified by the intrusion prevention system and instantly dropped.',
            highlightElementIds: ['firewall-1', 'packet-bad'],
            elements: [
              { id: 'cloud-1', type: 'cloud', x: 100, y: 220, label: 'External WAN' },
              { id: 'cable-1', type: 'cable', x: 250, y: 250, fromId: 'cloud-1', toId: 'firewall-1' },
              { id: 'firewall-1', type: 'firewall', x: 380, y: 190, label: 'NGFW / IPS Engine', sublabel: 'ATTACK: SQLi CVE Alert', status: 'blocked' },
              { id: 'cable-2', type: 'cable', x: 520, y: 250, fromId: 'firewall-1', toId: 'server-1' },
              { id: 'server-1', type: 'server', x: 680, y: 210, label: 'App Cluster' },
              { id: 'packet-bad', type: 'packet', x: 375, y: 235, label: 'TCP RST Dropped', status: 'blocked' }
            ],
            packet: { fromId: 'cloud-1', toId: 'firewall-1', payload: 'SQLi Signature', progress: 0.95, status: 'blocked' }
          }
        ]
      }
    }
  }
};

export function getCuratedLesson(topic: string, level: LearnerLevel): { explanation: string; analogy: string; diagram: DiagramLesson } | null {
  // Normalize topic search
  const foundKey = Object.keys(CURATED_LESSONS).find(k => k.toLowerCase() === topic.toLowerCase() || topic.toLowerCase().includes(k.toLowerCase()));
  if (foundKey && CURATED_LESSONS[foundKey]?.[level]) {
    return CURATED_LESSONS[foundKey][level];
  }
  return null;
}
