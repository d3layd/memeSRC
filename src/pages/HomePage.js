import { API } from 'aws-amplify';
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullScreenSearch from '../sections/search/FullScreenSearch';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [seriesTitle, setSeriesTitle] = useState('_universal');

  const navigate = useNavigate();

  useEffect(() => {
    API.get('publicapi', '/search/test', { queryStringParameters: { warmup: true } })
  }, [])

  const handleSearch = useCallback((e) => {
    if(e) {
      e.preventDefault();
    }
    const encodedSearchTerms = encodeURI(searchTerm)
    console.log(`Navigating to: '${`/search/${seriesTitle}/${encodedSearchTerms}`}'`)
    navigate(`/search/${seriesTitle}/${encodedSearchTerms}`)
  }, [seriesTitle, searchTerm, navigate]);

  return (
    <FullScreenSearch searchFunction={handleSearch} setSearchTerm={setSearchTerm} setSeriesTitle={setSeriesTitle} searchTerm={searchTerm} seriesTitle={seriesTitle} />  
  );
}
