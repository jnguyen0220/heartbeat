<script lang="ts">
	import { onMount } from 'svelte';
	import { Grid, type GridReadyEvent } from 'ag-grid-community';
	import TopAppBar from '@smui/top-app-bar';
	import { Row, Section, Title } from '@smui/top-app-bar';
	import IconButton, { Icon } from '@smui/icon-button';
	import Button, { Label } from '@smui/button';
	import { io } from 'socket.io-client';

	let gridContainer: any = null;
	let grid: any = null;
	const socket = io();

	socket.on('welcome', (message: any[]) => {
		console.log(message);
		const { gridOptions: gridOp } = grid;
		!gridOp.api.getDisplayedRowCount() && gridOp.api.applyTransaction({ add: message });
	});
	socket.on('update', (message: any) => {
		const { gridOptions: gridOp } = grid;
		const rowNode = gridOp.api.getRowNode(message.name);
		gridOp.api.applyTransaction({ update: [{ ...rowNode.data, ...message }] });
	});

	const columnDefs = [
		{ field: 'name' },
		{ field: 'interval' },
		{ field: 'address' },
		{ field: 'timestamp', cellRenderer: 'agAnimateShowChangeCellRenderer' },
		{ field: 'uptime' },
		{ field: 'lastStatusChange' }
	];

	const onGridReady = ({ api }: GridReadyEvent) => {
		api.sizeColumnsToFit();
	};

	const gridOptions = {
		columnDefs: columnDefs,
		rowData: [],
		onGridReady: onGridReady,
		getRowId: (params: any) => params.data.name
	};

	onMount(() => {
		grid = new Grid(gridContainer, gridOptions);
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css" />
	<link
		rel="stylesheet"
		href="https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css"
	/>
</svelte:head>
<div class="container">
	<TopAppBar variant="static" color="primary">
		<Row>
			<Section>
				<IconButton class="material-icons">menu</IconButton>
				<Title>AM I ALIVE</Title>
			</Section>
		</Row>
	</TopAppBar>
	<TopAppBar variant="static" color="secondary" dense>
		<Row class="tool">
			<Section align="start" toolbar>
				<Button>
					<Icon class="material-icons">add</Icon>
					<Label>Add</Label>
				</Button>
			</Section>
		</Row>
	</TopAppBar>
	<div class="main">
		<div
			id="datagrid"
			class="ag-theme-alpine"
			style="height: 100%; width:100%;"
			bind:this={gridContainer}
		/>
	</div>
</div>

<style>
	.main {
		height: 100%;
		/* align-self: stretch; */
	}
	.container {
		min-height: 100vh;
		display: grid;
		align-items: stretch;
		grid-template-rows: min-content min-content auto;
	}
</style>
