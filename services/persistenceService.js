
import app from '../firebaseConfig.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const db = getFirestore(app);
const APP_DOC_ID = 'main_app_data';

export const persistenceService = {
  save: async (data) => {
    try {
      const dataToSave = {
        ...data,
        lastBackup: new Date().toISOString()
      };
      await setDoc(doc(db, 'appState', APP_DOC_ID), dataToSave);
      return true;
    } catch (e) {
      console.error("Error guardando en Firestore:", e);
      return false;
    }
  },

  loadInitialData: async (initialData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const docRef = doc(db, 'appState', APP_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const dataWithTimestamp = { ...initialData, lastBackup: new Date().toISOString() };
        await setDoc(docRef, dataWithTimestamp);
        return dataWithTimestamp;
      } else {
        const cloudData = docSnap.data();
        return { ...initialData, ...cloudData };
      }
    } catch (e) {
      console.error("Error cargando datos iniciales desde Firestore:", e);
      return initialData;
    }
  },

  subscribeToChanges: (callback) => {
    const docRef = doc(db, 'appState', APP_DOC_ID);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        console.warn("El documento de Firestore no existe durante la suscripción. Esto podría ocurrir si se borra la base de datos.");
      }
    }, (error) => {
      console.error("Error al escuchar cambios en Firestore:", error);
    });

    return unsubscribe;
  },

  exportBackup: (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `cloud_estate_backup_${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  importBackup: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result);
          if (data.properties && data.users) {
            await persistenceService.save(data);
            resolve(data);
          } else {
            reject(new Error("Formato de backup inválido"));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Error leyendo el archivo"));
      reader.readAsText(file);
    });
  }
};