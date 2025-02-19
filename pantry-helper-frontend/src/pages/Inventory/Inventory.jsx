// Using Sorting & selecting table from Material UI v5.15.15
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Toolbar, Typography, Paper, Checkbox, IconButton, Tooltip, FormControlLabel, Switch, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, FormControl, TextField, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import OutboundIcon from '@mui/icons-material/Outbound';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddItemModal from './components/AddItemModal';
import BatchUploadModal from './components/BatchUpdateModal';
import OutgoingItemModal from './components/OutgoingItemModal';
import './Inventory.css'
import { fetchInventory, addItem, deleteItem, updateItem, addOutgoingEntry, addIncomingEntry } from '../../services/inventoryService';
import AddExistingItemModal from './components/AddExistingItemModal';
import { useProfile } from '../../context/ProfileContext';
import { fetchPantryUsers } from '../../services/pantryUserService';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';

// Sorts by stock status priority first, then falls back to alphanumeric or other custom logic
function descendingComparator(a, b, orderBy) {
  if (orderBy === 'name') {
    return b.Name.localeCompare(a.Name);
  }
  if (orderBy === 'stockStatus' || orderBy === 'quantity') {
    return b.Quantity - a.Quantity;
  }
  if (orderBy === 'expirationDate') {
    return new Date(b.ExpDate) - new Date(a.ExpDate);
  }
  if (orderBy === 'incomingDate') {
    return new Date(b.incomingDate) - new Date(a.incomingDate);
  }

  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// Define EnhancedTableHead before the main Inventory component
function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, userAuthority } = props;
  const createSortHandler = (property) => (event) => { onRequestSort(event, property); };

  const headCells = userAuthority === 'recipient' ? [
    { id: 'name', numeric: false, disablePadding: false, label: 'Product Name' },
    { id: 'quantity', numeric: false, disablePadding: false, label: 'Quantity' },
    { id: 'location', numeric: false, disablePadding: false, label: 'Location' },
    { id: 'stockStatus', numeric: false, disablePadding: false, label: 'Stock Status' },
  ] : [
    // Original headCells for staff
    { id: 'name', numeric: false, disablePadding: true, label: 'Product Name' },
    { id: 'quantity', numeric: false, disablePadding: false, label: 'Quantity' },
    { id: 'location', numeric: false, disablePadding: false, label: 'Location' },          
    { id: 'expirationDate', numeric: false, disablePadding: false, label: 'Expiration Date' },
    { id: 'incomingDate', numeric: false, disablePadding: false, label: 'Incoming Date' },
    { id: 'stockStatus', numeric: false, disablePadding: false, label: 'Stock Status' },
  ];

  return (
    <TableHead>
      <TableRow>
        {userAuthority !== 'recipient' && (
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all items',
              }}
            />
          </TableCell>
        )}
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id && headCell.id !== 'name'}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// Define EnhancedTableToolbar before the main Inventory component
function EnhancedTableToolbar(props) {
  const { 
    numSelected, 
    onDelete, 
    onOpenOutgoing, 
    onToggleFilterDrawer, 
    onOpenIncoming, 
    userAuthority,
    onAddNew,
    onBatchUpload,
    onSearch
  } = props;
  
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <React.Fragment>
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
          <Tooltip title="Incoming">
            <IconButton onClick={onOpenIncoming}>
              <AddCircleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Outgoing">
            <IconButton onClick={onOpenOutgoing}>
              <OutboundIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </React.Fragment>
      ) : (
        <div className="toolbar-container">
          <div className="search-container">
            <SearchOutlined style={{ color: '#666', marginRight: '8px' }} />
            <Input 
              placeholder="Search" 
              onChange={onSearch}
              style={{ width: '300px' }}
              bordered={false}
            />
          </div>
          {userAuthority !== 'recipient' && (
            <div className="actions-container">
              <Button
                type="primary"
                onClick={onAddNew}
                className="add-item-button"
              >
                Add new item
              </Button>
              <Button onClick={onBatchUpload}>
                Batch Upload
              </Button>
              <Tooltip title="Filter list">
                <IconButton onClick={onToggleFilterDrawer}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </Toolbar>
  );
}

export default function Inventory() {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('name');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [outgoingModalVisible, setOutgoingModalVisible] = useState(false);
  const [addExistingModalVisible, setAddExistingModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [currentPantry, setCurrentPantry] = useState('');
  const [userAuthority, setUserAuthority] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItemIds, setDeleteItemIds] = useState([]);
  const [filters, setFilters] = useState({
    expirationDate: '',
    incomingDate: '',
    quantity: '',
    quantityComparison: '>=',
    stockStatus: '',
  });

  const { profile } = useProfile();

  useEffect(() => {
    // Fetch pantry user authority whenever currentPantry updates
    const fetchPantryUser = async () => {
      try {
        const response = await fetchPantryUsers();
        const pantryUsers = response.data;
  
        // Find user authority for the current profileID and currentPantry
        const currentAuthority = pantryUsers.find(
          user => user.profileID === profile?.profileID && user.pantryID === currentPantry
        )?.userAuthority;
  
        setUserAuthority(currentAuthority || null); // Set or clear user authority
      } catch (error) {
        console.error('Error fetching pantry users:', error);
      }
    };
  
    if (profile && currentPantry) {
      fetchPantryUser();
    }
  }, [currentPantry, profile]);

  useEffect(()=>{
    if(profile){
      setCurrentPantry(profile.currentPantry)
      setPage(0)
    }
  },[profile])

  // Function to reset all filters
  const resetFilters = () => {
    setFilters({
      expirationDate: '',
      incomingDate: '',
      quantity: '',
      quantityComparison: '>=',
      stockStatus: '',
    });
  };

  const handleToggleFilterDrawer = () => {
    setIsFilterDrawerOpen(!isFilterDrawerOpen);
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.Name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesExpiration = !filters.expirationDate || new Date(item.ExpDate) <= new Date(filters.expirationDate);
    const matchesIncoming = !filters.incomingDate || new Date(item.incomingDate) >= new Date(filters.incomingDate);

    // Correct logic for quantity comparison
    let matchesQuantity = true;
    if (filters.quantity) {
      switch (filters.quantityComparison) {
        case '>=':
          matchesQuantity = item.Quantity >= filters.quantity;
          break;
        case '<=':
          matchesQuantity = item.Quantity <= filters.quantity;
          break;
        case '>':
          matchesQuantity = item.Quantity > filters.quantity;
          break;
        case '<':
          matchesQuantity = item.Quantity < filters.quantity;
          break;
        default:
          matchesQuantity = true;
      }
    }

    const determineStockStatus = (quantity) => {
      if (quantity == 0) return 'Out of stock';
      if (quantity <= 10) return 'Few items left';
      return 'In stock';
    };
    
    const matchesStockStatus = !filters.stockStatus || determineStockStatus(item.Quantity) === filters.stockStatus;

    return matchesSearch && matchesExpiration && matchesIncoming && matchesQuantity && matchesStockStatus;
});

  // Filter Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const selectedRows = data.filter(row => selected.includes(row.id));

  useEffect(() => {
    if(currentPantry){
      loadInventory();
    }
  }, [currentPantry]);

  // Set the inventory data fetched from the server
  const loadInventory = async () => {
      const response = await fetchInventory(currentPantry);
      console.log(response)
      setData(response.data);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value); // Update the search query state
  };

  const handleAdd = async (newItem) => {
    const response = await addItem(newItem, currentPantry);
    if (response.status === 200) {
      await loadInventory(); // Refresh the list after adding
      setAddModalVisible(false);
    } else {
      console.error('Failed to add item');
      // Handle errors here, e.g., show an error message
    }
  };

  const showAddModal = () => {
    setAddModalVisible(true);
  };

  const handleAddCancel = () => {
    setAddModalVisible(false);
  };

  const showOutgoingModal = () => {
    setOutgoingModalVisible(true);
  };

  const handleOutgoingCancel = () => {
    setOutgoingModalVisible(false);
  };

  const showAddExistingModal = () => {
    setAddExistingModalVisible(true);
  };

  const handleAddExistingCancel = () => {
    setAddExistingModalVisible(false);
  };

  const showBatchModal = () => {
    setBatchModalVisible(true);
  };

  const handleBatchClose = () => {
    setBatchModalVisible(false);
  };

  const handleConfirmOutgoing = async (outgoingData) => {
    try {
      for (const item of selectedRows) {
        const outgoingQuantity = outgoingData[`quantity_${item.id}`]; // Get quantity for this item
        const outgoingDate = outgoingData.outgoingDate.format('YYYY-MM-DD'); // Ensure the date is properly formatted

        const updatedQuantity = item.Quantity - outgoingQuantity

        const updatedItem = {
          id: item.id,
          name: item.Name,
          quantity: updatedQuantity,
          outgoingDate: outgoingDate,
        };

        // Prepare data for updating the Outgoing table
        const outgoingEntry = {
          name: item.Name,
          dateOut: outgoingDate,
          quantity: outgoingQuantity,
        };
  
        // Send update request to the backend
        const response = await updateItem(item.id, updatedItem, currentPantry);
  
        if (response.status === 200) {
          console.log(`Item ${item.Name} updated successfully in Inventory`);
  
          // Send a request to update the Outgoing table
          await addOutgoingEntry(outgoingEntry, currentPantry);
        } else {
          console.error(`Failed to update item ${item.Name}`);
        }
      }
  
      // Refresh the inventory after updating
      await loadInventory();
      setOutgoingModalVisible(false);
    } catch (error) {
      console.error('Error confirming outgoing items:', error);
    }
  };

  const handleConfirmIncoming = async (incomingData) => {
    try {
      for (const item of selectedRows) {
        const incomingQuantity = incomingData[`quantity_${item.id}`];
        const incomingDate = incomingData.incomingDate ? incomingData.incomingDate.format('YYYY-MM-DD') : null;
        const expirationDate = incomingData.expirationDate ? incomingData.expirationDate.format('YYYY-MM-DD') : null;

        // Create the incoming entry data
        const incomingEntry = {
          name: item.Name,
          dateIn: incomingDate,
          quantity: incomingQuantity,
        };
        // Add the entry to the Incoming table
        const incomingResponse = await addIncomingEntry(incomingEntry, currentPantry);

        if (incomingResponse.status === 200) {
          console.log(`Incoming entry for ${item.Name} added successfully`);
        } else {
          console.error(`Failed to add incoming entry for ${item.Name}`);
        }
  
        // Update the item with new quantity and dates if they are provided
        const updatedItem = {
          id: item.id,
          name: item.Name,
          quantity: item.Quantity + incomingQuantity,  // Add the new quantity to existing
          ...(expirationDate && { expirationDate })  // Update if expirationDate is provided
        };
  
        // Send the update request to the server
        const response = await updateItem(item.id, updatedItem, currentPantry);
  
        if (response.status === 200) {
          console.log(`Item ${item.Name} updated successfully in Inventory`);
        } else {
          console.error(`Failed to update item ${item.Name}`);
        }
      }
  
      // Refresh the inventory after updating
      await loadInventory();
      setAddExistingModalVisible(false);
    } catch (error) {
      console.error('Error confirming incoming items:', error);
    }
  };
  
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleConfirmDelete = async () => {
    try {
      for (const itemId of deleteItemIds) {
        await deleteItem(itemId, currentPantry);
      }
      setSelected([]);
      handleDeleteModalClose();
      await loadInventory(); // Refresh the inventory
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  const handleDelete = () => {
    handleDeleteModalOpen(selected); // Open modal with selected items
  };

    // Function to open the delete confirmation modal
    const handleDeleteModalOpen = (itemIds) => {
      setDeleteItemIds(itemIds);
      setDeleteModalOpen(true);
    };
  
    // Function to close the delete confirmation modal
    const handleDeleteModalClose = () => {
      setDeleteModalOpen(false);
      setDeleteItemIds([]);
    };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    const visibleRows = React.useMemo(() => {
      return stableSort(filteredData, getComparator(order, orderBy))
        .slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    }, [filteredData, order, orderBy, page, rowsPerPage, data]);
    
  return (
    <div className='inventory_title'>
      {/* Confirmation Dialog */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteModalClose}
        aria-labelledby="delete-confirmation-title"
        aria-describedby="delete-confirmation-description"
      >
        <DialogTitle id="delete-confirmation-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirmation-description">
            Are you sure you want to delete the selected item(s)? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteModalClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      <Drawer anchor="right" open={isFilterDrawerOpen} onClose={handleToggleFilterDrawer}>
        <Box sx={{ width: 300, padding: 2 }}>
          <Typography variant="h6">Filter Options</Typography>
          <FormControl fullWidth margin="normal">
            <TextField
              label={`Before ${filters.expirationDate || 'mm/dd/yyyy'}`}
              type="date"
              name="expirationDate"
              InputLabelProps={{ shrink: true }}
              onChange={handleFilterChange}
              value={filters.expirationDate}
              InputProps={{
                startAdornment: <InputAdornment position="start">Before</InputAdornment>,
              }}
            />
          </FormControl>


          <FormControl fullWidth margin="normal">
            <TextField
              label={`After ${filters.incomingDate || 'mm/dd/yyyy'}`}
              type="date"
              name="incomingDate"
              InputLabelProps={{ shrink: true }}
              onChange={handleFilterChange}
              value={filters.incomingDate}
              InputProps={{
                startAdornment: <InputAdornment position="start">After</InputAdornment>,
              }}
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Quantity Comparison</InputLabel>
            <Select
              label="Quantity Comparison"
              name="quantityComparison"
              onChange={handleFilterChange}
              value={filters.quantityComparison}
            >
              <MenuItem value=">=">{'>='}</MenuItem>
              <MenuItem value="<=">{'<='}</MenuItem>
              <MenuItem value=">">{'>'}</MenuItem>
              <MenuItem value="<">{'<'}</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <TextField
              label="Quantity"
              type="number"
              name="quantity"
              onChange={handleFilterChange}
              value={filters.quantity}
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Stock Status</InputLabel>
            <Select
              label="Stock Status"
              name="stockStatus"
              onChange={handleFilterChange}
              value={filters.stockStatus}
            >
              <MenuItem value="In stock">In stock</MenuItem>
              <MenuItem value="Few items left">Few items left</MenuItem>
              <MenuItem value="Out of stock">Out of stock</MenuItem>
            </Select>
          </FormControl>
          {/* Reset Filters Button */}
          <Box className="resetFilterButtonBox">
            <Button variant="contained" color="primary" onClick={resetFilters}>
              Reset Filters
            </Button>
          </Box>
        </Box>
      </Drawer>
      <BatchUploadModal
        visible={batchModalVisible}
        onClose={handleBatchClose}
        pantryID={currentPantry}
        reloadInventory={loadInventory}
      />
      <AddItemModal
        open={addModalVisible}
        onCreate={handleAdd}
        onCancel={handleAddCancel}
      />
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <EnhancedTableToolbar 
            numSelected={selected.length} 
            onOpenOutgoing={showOutgoingModal} 
            onDelete={handleDelete} 
            onToggleFilterDrawer={handleToggleFilterDrawer} 
            onOpenIncoming={showAddExistingModal} 
            userAuthority={userAuthority}
            onAddNew={showAddModal}
            onBatchUpload={showBatchModal}
            onSearch={(e) => handleSearch(e)}
          />
          <OutgoingItemModal
            open={outgoingModalVisible}
            onConfirm={handleConfirmOutgoing}
            selectedItems={selectedRows}
            onCancel={handleOutgoingCancel}
          />
          <AddExistingItemModal
            open={addExistingModalVisible}
            onConfirm={handleConfirmIncoming}
            selectedItems={selectedRows}
            onCancel={handleAddExistingCancel}
          />
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={dense ? 'small' : 'medium'}
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={data.length}
                userAuthority={userAuthority}
              />
            <TableBody>
  {visibleRows.map((row, index) => {
    const isItemSelected = isSelected(row.id);
    const labelId = `enhanced-table-checkbox-${index}`;

    // Determine stock status and color
    let color;
    let status;
    
    if (row.Quantity == 0) {
      color = '#F47174';
      status = 'Out of stock';
    } else if (row.Quantity > 0 && row.Quantity <= 10) {
      color = '#4fc0e3';
      status = 'Few items left';
    } else {
      color = '#8ad142';
      status = 'In stock';
    }

    return (
      <TableRow
        hover
        key={row.id}
        tabIndex={-1}
        sx={{ cursor: userAuthority === 'recipient' ? 'default' : 'pointer' }}
      >
        {userAuthority !== 'recipient' && (
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              checked={isItemSelected}
              onClick={(event) => handleClick(event, row.id)}
              inputProps={{
                'aria-labelledby': labelId,
              }}
            />
          </TableCell>
        )}
        <TableCell
          component="th"
          id={labelId}
          scope="row"
          padding={userAuthority === 'recipient' ? 'normal' : 'none'}
        >
          {row.Name}
        </TableCell>
        <TableCell align="left">
          {`${row.Quantity} lb`}
        </TableCell>
        <TableCell align="left">{row?.locationName || 'N/A'}</TableCell>
        {userAuthority !== 'recipient' && (
          <>
            <TableCell align="left">{row?.ExpDate?.slice(0, 10)}</TableCell>
            <TableCell align="left">{row?.incomingDate?.slice(0, 10) || 'N/A'}</TableCell>
          </>
        )}
        <TableCell align="left">
          <div className="stock-status-indicator">
            <div
              className="status-dot"
              style={{ backgroundColor: color }}
            />
            <span>{status}</span>
          </div>
        </TableCell>
      </TableRow>
    );
  })}
  {emptyRows > 0 && (
    <TableRow
      style={{
        height: (dense ? 33 : 53) * emptyRows,
      }}
    >
      <TableCell colSpan={6} />
    </TableRow>
  )}
</TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
      </Box>
    </div>
  );
}
