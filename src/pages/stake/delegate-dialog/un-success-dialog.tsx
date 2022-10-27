import React, { FunctionComponent } from 'react';
import { Dialog, DialogContent } from '@material-ui/core';
import variables from 'src/utils/variables';
import { failedDialogActions } from 'src/reducers/slices';
import failed from 'src/assets/stake/failed.svg';
import { config } from 'src/config-insync';
import { useActions } from 'src/hooks/use-actions';
import { useAppSelector } from 'src/hooks/use-app-select';
import { RootState } from 'src/reducers/store';
import { ResultDialogHeader, ResultDialogText } from './components';

const selector = (state: RootState) => {
	return {
		lang: state.language,
		open: state.stake.failedDialog.open,
		message: state.stake.failedDialog.message,
		hash: state.stake.failedDialog.hash,
	};
};

const UnSuccessDialog: FunctionComponent = () => {
	const [handleClose] = useActions([failedDialogActions.hideFailedDialog]);
	const { lang, open, message, hash } = useAppSelector(selector);

	const handleRedirect = () => {
		const link = `${config.EXPLORER_URL}/${hash}`;
		window.open(link, '_blank');
	};

	return (
		<Dialog
			aria-describedby="delegate-dialog-description"
			aria-labelledby="delegate-dialog-title"
			className="dialog delegate_dialog result"
			open={open}
			onClose={handleClose}>
			<DialogContent className="content">
				<div className="text-center">
					<img alt="failed" src={failed} />
					{<ResultDialogHeader>{variables[lang]['transaction_failed']}</ResultDialogHeader>}
					<ResultDialogText>{message}</ResultDialogText>
				</div>

				{hash && (
					<div className="flex justify-between mt-9 mb-4">
						<ResultDialogText>{variables[lang]['transaction_hash']}</ResultDialogText>
						<div className="w-36 cursor-pointer hover:underline" title={hash} onClick={handleRedirect}>
							<ResultDialogText className="name">{hash}</ResultDialogText>
							{hash && hash.slice(hash.length - 6, hash.length)}
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default UnSuccessDialog;