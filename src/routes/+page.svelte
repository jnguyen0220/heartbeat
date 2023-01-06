<script lang="ts">
	import { io } from 'socket.io-client';
	import { onMount } from 'svelte';
	import { Grid, type GridReadyEvent } from 'ag-grid-community';
	import TopAppBar from '@smui/top-app-bar';
	import { Row, Section, Title } from '@smui/top-app-bar';
	import IconButton from '@smui/icon-button';

	let gridContainer: any = null;
	let grid: any = null;
	const socket = io();

	socket.on('welcome', (message: any[]) => {
		console.log(message);
		const { gridOptions: gridOp } = grid;
		gridOp.api.applyTransaction({ add: message });
	});
	socket.on('update', (message) => {
		const { gridOptions: gridOp } = grid;
		const rowNode = gridOp.api.getRowNode(message.name);
		gridOp.api.applyTransaction({ update: [{ ...rowNode.data, ...message }] });
	});

	const columnDefs = [
		{ field: 'name' },
		{ field: 'interval' },
		{ field: 'address' },
		{ field: 'timestamp', cellRenderer: 'agAnimateShowChangeCellRenderer' }
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
<div class="flexy">
	<div class="top-app-bar-container flexor">
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
					<IconButton class="material-icons" aria-label="Download">file_download</IconButton>
					<IconButton class="material-icons" aria-label="Print this page">print</IconButton>
					<IconButton class="material-icons" aria-label="Bookmark this page">bookmark</IconButton>
				</Section>
			</Row>
		</TopAppBar>
		<div
			id="datagrid"
			class="ag-theme-alpine"
			style="height: 100%; width:100%"
			bind:this={gridContainer}
		/>
	</div>
</div>

<style>
	.top-app-bar-container {
		width: 100%;
		height: 320px;
		border: 1px solid var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));
		margin: 0 18px 18px 0;
		background-color: var(--mdc-theme-background, #fff);
		overflow: auto;
		display: inline-block;
	}
	.flexor {
		display: inline-flex;
		flex-direction: column;
	}
	.flexy {
		display: flex;
		flex-wrap: wrap;
	}
</style>
