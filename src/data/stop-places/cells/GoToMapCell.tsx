import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { StopPlace } from '../stopPlaceTypes.ts';

interface GoToMapCellProps {
  item: StopPlace;
}

export default function GoToMapCell({ item }: GoToMapCellProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lng, lat] = item.geometry.legacyCoordinates?.[0] ?? [null, null];

  const handleGoToMap = () => {
    if (item.id) {
      navigate(`/map?stopPlaceId=${item.id}`);
    }
  };

  return (
    <Button variant="contained" size="small" onClick={handleGoToMap} disabled={!lng || !lat}>
      {t('data.table.row.goToMapTooltip', 'View on map')}
    </Button>
  );
}
