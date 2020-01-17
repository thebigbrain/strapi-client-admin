import {styled} from "@material-ui/styles";

export const FlexPadding = styled('i')({
  flexGrow: 1,
});

export const PageContainer = styled('div')({
  width: '100vw',
  height: '100vh'
});

export const StyledQuoteBoard = styled('div')({
  height: 'calc(100% - 36px - 45px)',
  width: '100%',
  overflow: 'auto',
});

export const FullFlexRow = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '100%',
})