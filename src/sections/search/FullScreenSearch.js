import styled from "@emotion/styled";
import { Grid, Typography } from "@mui/material";

const StyledForm = styled.form`
  display: 'flex'
`;

const StyledGridContainer = styled(Grid)`
  min-height: 100vh;
  background-image: linear-gradient(45deg,
    #5461c8 12.5% /* 1*12.5% */,
    #c724b1 0, #c724b1 25%   /* 2*12.5% */,
    #e4002b 0, #e4002b 37.5% /* 3*12.5% */,
    #ff6900 0, #ff6900 50%   /* 4*12.5% */,
    #f6be00 0, #f6be00 62.5% /* 5*12.5% */,
    #97d700 0, #97d700 75%   /* 6*12.5% */,
    #00ab84 0, #00ab84 87.5% /* 7*12.5% */,
    #00a3e0 0);

`;

const StyledLabel = styled.label(({ theme }) => ({
  marginBottom: '8px',
  color: theme.palette.text.secondary,
}));

const StyledInput = styled.input(({ theme }) => ({
  fontSize: '16px',
  padding: '8px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '4px',
}));

const StyledButton = styled.button(({ theme }) => ({
  fontSize: '16px',
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));


export default function FullScreenSearch(props) {
    return (
        <StyledGridContainer container>
        <Grid container marginY='auto' justifyContent='center'>
          <Grid xs={12} textAlign='center' marginBottom={5}>
            <Typography component='h1' variant='h1' sx={{ color: '#FFFFFF' }}>
              memeSRC
            </Typography>
          </Grid>
          <StyledForm onSubmit={e => props.searchFunction(e)}>
            <Grid container alignItems={'center'}>
              <Grid item md={5} sm='auto'>
                <StyledLabel htmlFor="search-term">
                  <StyledInput
                    type="text"
                    id="search-term"
                    value={props.searchTerm}
                    placeholder="What's the quote?"
                    onChange={e => props.setSearchTerm(e.target.value)} />
                </StyledLabel>
              </Grid>
              <Grid item md={5} sm='auto'>
                <StyledLabel htmlFor="series-title">
                  <StyledInput
                    type="text"
                    id="series-title"
                    value={props.seriesTitle}
                    placeholder="Series ID (optional)"
                    onChange={e => props.setSeriesTitle(e.target.value)} />
                </StyledLabel>
              </Grid>
              <Grid item md={2} sm={12}>
                <StyledButton type="submit">Search</StyledButton>
              </Grid>
            </Grid>
          </StyledForm>
        </Grid>
      </StyledGridContainer>
    )
}