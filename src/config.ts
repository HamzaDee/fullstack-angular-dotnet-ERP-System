export const config = {
  apiUrl: 'http://ui-lib-demo-api.herokuapp.com',
       apiURL_Main: "http://localhost:7209",
      // apiURL_Main: "http://94.249.83.196:7206",
      // apiURL_Main: "http://10.0.1.60:7209", // Galaxy Main
      // apiURL_Main: "http://10.0.1.60:7211", // ANAS Galaxy
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7308' : window.location.hostname ==='10.0.1.60'?'http://10.0.1.60:7308':'http://94.249.83.196:7308',//Galaxy Demo
      // apiURL_Main: "http://10.0.1.60:7223", // IRBID Galaxy
      // apiURL_Main: "http://10.0.1.60:7302", //Galaxy Aqaba
      // apiURL_Main: "http://10.0.1.60:9808", //Galaxy Rahebat
      // apiURL_Main: "http://10.0.1.60:9901", //Galaxy Mahbih
      // apiURL_Main: "http://192.168.180.10:7209", //iraq
      // apiURL_Main: "http://192.168.1.98:7209", //Rahibat
      // apiURL_Main: "http://172.16.0.245:7209", //Irbid special
      // apiURL_Main: "http://46.185.162.46:7209", //billa
      // apiURL_Main: "http://10.0.1.60:7222", //AnasLocal
      // apiURL_Main: "http://10.0.1.60:7101", // Maysam Local
      // apiURL_Main: "http://10.0.1.60:729", // Khaldi Maysam
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='10.0.1.41'?'http://10.0.1.41:7209':'http://10.0.1.41:7209',//NidalLocal
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='10.0.1.130'?'http://10.0.1.130:7209':'http://10.0.1.130:7209',//AlaaLocal
      // apiURL_Main: "http://10.0.1.60:7555", //HISLocal
      // apiURL_Main: "http://94.249.83.196:7206", //BillaLocal
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='192.168.1.9'?'http://192.168.1.9:7209':'http://192.168.1.9:7209',//hashimia
      // apiURL_Main:'http://192.168.1.9:7209',//hashimia2
      // apiURL_Main: "http://127.0.0.1:7209", //Default Connection
      // apiURL_Main: "http://192.168.1.15:7209", // Kansaa Hospital
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='192.168.1.200'?'http://192.168.1.200:7209':'http://217.23.34.88:7209',// Irbid Clincs
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7205' : window.location.hostname ==='192.168.1.200'?'http://192.168.1.200:7205':'http://217.23.34.88:7205',// Irbid Clincs Old
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='192.168.100.130'?'http://192.168.100.130:7209':'http://agdarcenter.ddns.net:7209', //KSA Clinc
      // apiURL_Main:window.location.hostname ==='localhost'?'https://localhost:7218' : window.location.hostname ==='192.168.100.130'?'https://192.168.100.130:7218':'https://test-erp.agdarcenter.com', //KSA ClincTest
      // apiURL_Main: "http://109.237.204.71:7209", // teleskoop
      // apiURL_Main: "http://192.168.88.12:7209", // teleskoop local
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='10.12.3.6'?'http://10.12.3.6:7209':'http://10.12.3.6:7209', //Aqaba Clinc
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='192.168.0.12'?'http://192.168.0.12:7209':'http://192.168.0.12:7209', //Mahabah Hospital
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='192.168.0.80'?'http://192.168.0.80:7209':'http://192.168.0.80:7209', //International Sama
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7201' : window.location.hostname ==='192.168.0.80'?'http://192.168.0.80:7201':'http://192.168.0.80:7201', //International SamaTest
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='192.168.1.14'?'http://192.168.1.14:7209':'http://192.168.1.14:7209', //AirLine
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='192.168.1.14'?'http://192.168.180.10:7209':'http://192.168.180.10:7209', //Alhaditheieh Hospital
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:8999' : window.location.hostname ==='10.0.1.170'?'http://10.0.1.170:8999':'http://10.0.1.170:8999', //Khaldiii
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='192.168.1.154'?'http://192.168.1.154:7209':'http://192.168.1.154:7209', //Wannana
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7201' : window.location.hostname ==='192.168.1.154'?'http://192.168.1.154:7201':'http://192.168.1.154:7201', //Wannana Test
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='192.168.10.254'?'http://192.168.10.254:7209':'http://46.185.208.42:7209', //Maysam
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:9201' : window.location.hostname ==='10.0.0.60'?'http://10.0.1.60:9201':'http://10.0.1.60:9201', //GalaxyTest
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='79.133.46.214'?'http://79.133.46.214:7209':'http://79.133.46.214:7209', //E5tyarkom
      // apiURL_Main: "http://192.168.1.91:7209", //Hadethah 
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='192.168.100.18'?'http://192.168.100.18:7209':'http://92.253.22.204:7209', //Hadethah Static IP 
      // apiURL_Main:window.location.hostname ==='localhost'?'http://localhost:7209' : window.location.hostname ==='192.168.100.18'?'http://192.168.100.18:7209':'http://192.168.100.18:7209', //E5tyarkom

      
  authRoles: {
    sa: ['SA'], // O nly Super Admin has access
    admin: ['SA', 'Admin'], // Only SA & Admin has access
    editor: ['SA', 'Admin', 'Editor'], // Only SA & Admin & Editor has access
    user: ['SA', 'Admin', 'Editor', 'User'], // Only SA & Admin & Editor & User has access
    guest: ['SA', 'Admin', 'Editor', 'User', 'Guest'] // Everyone has access
  }
} 