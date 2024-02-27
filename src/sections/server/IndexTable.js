import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';

// Function to fetch the title for a given item
const fetchTitle = async (item) => {
    const url = `https://ipfs.memesrc.com/ipfs/${item.cid}/00_metadata.json`;
    try {
        const response = await fetch(url);
        const metadata = await response.json();
        return metadata.title || '(missing)';
    } catch (error) {
        console.error('Failed to fetch title:', error);
        return '(missing)';
    }
};

// Function to check the pin status of an item
const checkPinStatus = async (cid) => {
    const electron = window.require('electron');
    try {
        const result = await electron.ipcRenderer.invoke('check-pin-status', cid);
        return result.success && result.isPinned;
    } catch (error) {
        console.error(`Failed to check pin status for CID ${cid}:`, error);
        return false;
    }
};

// Styled button for pinning actions with dynamic styling based on pin status
const PinningButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'pinned',
})(({ theme, pinned }) => ({
    width: '100px',
    height: '32px',
    fontSize: '0.75rem',
    textTransform: 'none',
    color: theme.palette.getContrastText(pinned ? theme.palette.success.main : theme.palette.grey[500]),
    backgroundColor: pinned ? theme.palette.success.main : theme.palette.grey[500],
    opacity: pinned ? 1 : 0.75,
    '&:hover': {
        backgroundColor: pinned ? theme.palette.success.dark : theme.palette.grey[700],
    },
}));

const IndexTable = () => {
    const [rows, setRows] = useState([]);
    const [loadingCIDs, setLoadingCIDs] = useState(() => {
        const savedLoading = sessionStorage.getItem('loadingCIDs');
        return savedLoading ? JSON.parse(savedLoading) : {};
    });

    useEffect(() => {
        sessionStorage.setItem('loadingCIDs', JSON.stringify(loadingCIDs));
    }, [loadingCIDs]);

    const fetchAndUpdateRows = () => {
        const electron = window.require('electron');
        electron.ipcRenderer.invoke('list-indexes')
            .then(async items => {
                const newLoadingCIDs = { ...loadingCIDs };
                const promises = items.map(async (item, index) => {
                    const title = await fetchTitle(item);
                    const isPinned = await checkPinStatus(item.cid);
                    // Use the safer approach for checking property existence
                    if (isPinned && Object.prototype.hasOwnProperty.call(newLoadingCIDs, item.cid)) {
                        delete newLoadingCIDs[item.cid];
                    }
                    return {
                        id: index,
                        index_name: title,
                        name: item.name,
                        cid: item.cid,
                        size: parseInt(item.size, 10),
                        cumulative_size: parseInt(item.cumulative_size, 10),
                        isPinned,
                    };
                });
                return Promise.all(promises).then((formattedRows) => {
                    setRows(formattedRows);
                    // Update only if there are changes
                    if (Object.keys(loadingCIDs).length !== Object.keys(newLoadingCIDs).length) {
                        setLoadingCIDs(newLoadingCIDs);
                        sessionStorage.setItem('loadingCIDs', JSON.stringify(newLoadingCIDs));
                    }
                });
            })
            .catch(error => {
                console.error('Failed to list directory contents:', error);
            });
    };    

    useEffect(() => {
        fetchAndUpdateRows(); // Initial fetch
        const interval = setInterval(fetchAndUpdateRows, 5000); // Set interval for periodic update
        return () => clearInterval(interval); // Cleanup on unmount
    }, []); // Dependencies are intentionally left blank to avoid re-triggering

    const togglePin = async (rowId, shouldPin) => {
        const row = rows.find(row => row.id === rowId);
        if (!row) return;

        setLoadingCIDs(prev => ({ ...prev, [row.cid]: true }));

        const electron = window.require('electron');
        const action = shouldPin ? 'pin-item' : 'unpin-item';
        const result = await electron.ipcRenderer.invoke(action, row.cid);

        setLoadingCIDs(prev => {
            const updated = { ...prev };
            delete updated[row.cid];
            return updated;
        });

        if (result.success) {
            const updatedRows = rows.map(r => r.id === rowId ? { ...r, isPinned: shouldPin } : r);
            setRows(updatedRows);
            console.log(`${shouldPin ? 'Pinned' : 'Unpinned'} CID ${row.cid}`);
        } else {
            console.error(`Failed to ${shouldPin ? 'pin' : 'unpin'} CID ${row.cid}:`, result.message);
        }
    };

    const columns = [
        {
            field: 'isPinned',
            headerName: 'Pinning',
            width: 130,
            renderCell: (params) => {
                const isLoading = loadingCIDs[params.row.cid];
                return isLoading ? (
                    <CircularProgress size={24} />
                ) : (
                    <PinningButton
                        variant="contained"
                        pinned={params.value}
                        onClick={(event) => {
                            event.stopPropagation();
                            togglePin(params.row.id, !params.value);
                        }}>
                        {params.value ? 'Pinned' : 'Unpinned'}
                    </PinningButton>
                );
            },
        },
        { field: 'index_name', headerName: 'Name', width: 200 },
        { field: 'cid', headerName: 'CID', width: 500 },
        { field: 'name', headerName: 'IPFS Path', width: 150 },
        { field: 'size', headerName: 'Size', width: 130, type: 'number' },
        { field: 'cumulative_size', headerName: 'Total Size', width: 180, type: 'number' },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                disableSelectionOnClick
                autoHeight
            />
        </Box>
    );
};

export default IndexTable;
