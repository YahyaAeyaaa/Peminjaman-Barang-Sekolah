import { useCallback, useEffect, useState } from 'react';
import { loansAPI } from '@/lib/api/loans';
import { returnsAPI } from '@/lib/api/returns';
import { useToast } from '@/components/ToastProvider';

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function useLaporan() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [returns, setReturns] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportType, setReportType] = useState('LOANS'); // LOANS | RETURNS | ALL

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (reportType === 'LOANS' || reportType === 'ALL') {
        const loansRes = await loansAPI.getAll();
        if (loansRes.success) {
          let loansData = loansRes.data || [];
          
          // Filter by date if provided
          if (dateFrom || dateTo) {
            loansData = loansData.filter((loan) => {
              const loanDate = new Date(loan.created_at);
              if (dateFrom && loanDate < new Date(dateFrom + 'T00:00:00')) return false;
              if (dateTo && loanDate > new Date(dateTo + 'T23:59:59')) return false;
              return true;
            });
          }
          
          setLoans(loansData);
        }
      }
      
      if (reportType === 'RETURNS' || reportType === 'ALL') {
        const returnsRes = await returnsAPI.getAll();
        if (returnsRes.success) {
          let returnsData = returnsRes.data || [];
          
          // Filter by date if provided
          if (dateFrom || dateTo) {
            returnsData = returnsData.filter((ret) => {
              const retDate = new Date(ret.created_at);
              if (dateFrom && retDate < new Date(dateFrom + 'T00:00:00')) return false;
              if (dateTo && retDate > new Date(dateTo + 'T23:59:59')) return false;
              return true;
            });
          }
          
          setReturns(returnsData);
        }
      }
      
      if (reportType === 'LOANS') {
        setReturns([]);
      }
      if (reportType === 'RETURNS') {
        setLoans([]);
      }
    } catch (e) {
      console.error('Error loading report data:', e);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  }, [reportType, dateFrom, dateTo, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    loading,
    loans,
    returns,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    reportType,
    setReportType,
    refetch: loadData,
  };
}


