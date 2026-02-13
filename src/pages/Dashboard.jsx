import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PrintLayout from '../components/PrintLayout';
import { db } from '../firebase';

const stickersCollection = collection(db, 'stickers');

function padCode(sequence) {
  return `CS${String(sequence).padStart(6, '0')}`;
}

async function reserveCodes(quantity) {
  const sequenceRef = doc(db, 'metadata', 'sequence');

  return runTransaction(db, async (transaction) => {
    const sequenceSnap = await transaction.get(sequenceRef);
    const lastSequence = sequenceSnap.exists() ? sequenceSnap.data().lastSequence || 0 : 0;
    const nextLastSequence = lastSequence + quantity;

    transaction.set(sequenceRef, { lastSequence: nextLastSequence }, { merge: true });

    return Array.from({ length: quantity }, (_, idx) => {
      const sequence = lastSequence + idx + 1;
      return {
        sequence,
        code: padCode(sequence),
      };
    });
  });
}

async function createStickerDocs(codeRecords) {
  const created = [];
  for (const record of codeRecords) {
    const docRef = await addDoc(stickersCollection, {
      code: record.code,
      createdAt: serverTimestamp(),
      printed: false,
    });
    created.push({ id: docRef.id, code: record.code, printed: false });
  }
  return created;
}

function Dashboard() {
  const [quantity, setQuantity] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState([]);
  const [allStickers, setAllStickers] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const stickersQuery = query(stickersCollection, orderBy('createdAt', 'desc'), limit(200));
    return onSnapshot(stickersQuery, (snapshot) => {
      const docs = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setAllStickers(docs);
    });
  }, []);

  const generateStickers = async () => {
    setError('');
    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError('Enter a valid positive number.');
      return;
    }

    setLoading(true);
    try {
      const reserved = await reserveCodes(parsedQuantity);
      const docs = await createStickerDocs(reserved);
      setGenerated(docs);
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      setError('Failed to generate stickers. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const markPrinted = async (stickers) => {
    const pending = stickers.filter((sticker) => !sticker.printed);
    await Promise.all(pending.map((sticker) => updateDoc(doc(db, 'stickers', sticker.id), { printed: true })));
  };

  const handlePrint = async () => {
    try {
      await markPrinted(generated);
      window.print();
    } catch (err) {
      console.error(err);
      setError('Unable to mark stickers as printed.');
    }
  };

  const handleReprintLoad = async () => {
    setLoading(true);
    setError('');
    try {
      const reprintQuery = query(
        stickersCollection,
        where('printed', '==', true),
        orderBy('createdAt', 'desc'),
        limit(8),
      );
      const result = await getDocs(reprintQuery);
      const docs = result.docs.map((item) => ({ id: item.id, ...item.data() }));
      setGenerated(docs);
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      setError('Unable to load reprint stickers.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    const node = document.getElementById('print-layout');
    if (!node) {
      setError('Nothing to export.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const canvas = await html2canvas(node, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save(`stickers-${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      setError('Failed to generate PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Car Sticker QR Generator</h1>

      <section className="panel no-print">
        <label htmlFor="quantity">Number of stickers</label>
        <input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
        <div className="actions">
          <button onClick={generateStickers} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
          <button onClick={handleReprintLoad} disabled={loading}>
            Reprint Last Printed
          </button>
          <button onClick={() => setShowPreview((value) => !value)} disabled={!generated.length}>
            {showPreview ? 'Hide Preview' : 'Preview Print'}
          </button>
          <button onClick={handlePrint} disabled={!generated.length || loading}>
            Print & Mark Printed
          </button>
          <button onClick={handleDownloadPdf} disabled={!generated.length || loading}>
            Download PDF
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="panel no-print">
        <h2>Generated This Session</h2>
        <ul className="code-list">
          {generated.map((item) => (
            <li key={item.id}>{item.code}</li>
          ))}
        </ul>
      </section>

      <section className="panel no-print">
        <h2>Recent Records</h2>
        <ul className="code-list compact">
          {allStickers.map((item) => (
            <li key={item.id}>
              <span>{item.code}</span>
              <span className={item.printed ? 'badge printed' : 'badge pending'}>
                {item.printed ? 'Printed' : 'Pending'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {showPreview && generated.length ? <PrintLayout stickers={generated} /> : null}
    </div>
  );
}

export default Dashboard;
