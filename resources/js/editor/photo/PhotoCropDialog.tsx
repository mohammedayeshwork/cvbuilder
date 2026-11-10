import { useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Photo } from '@/schema';
import { cropToDataUri } from './encode';

/** Crop a picked image to a square photo, round or square. */
export function PhotoCropDialog({
    source,
    initialShape,
    onClose,
    onSave,
}: {
    source: string | null;
    initialShape: Photo['shape'];
    onClose: () => void;
    onSave: (photo: Photo) => void;
}) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [area, setArea] = useState<Area | null>(null);
    const [shape, setShape] = useState<Photo['shape']>(initialShape);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!source || !area) {
            return;
        }

        setSaving(true);
        try {
            onSave({ src: await cropToDataUri(source, area), shape });
            onClose();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={source !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crop your photo</DialogTitle>
                </DialogHeader>
                <div className="relative h-72 overflow-hidden rounded-md bg-muted">
                    {source && (
                        <Cropper
                            image={source}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape={shape === 'round' ? 'round' : 'rect'}
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={(_, pixels) => setArea(pixels)}
                        />
                    )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="photo-zoom">Zoom</Label>
                        <input
                            id="photo-zoom"
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(event) =>
                                setZoom(Number(event.target.value))
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Shape</Label>
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            value={shape}
                            onValueChange={(value) =>
                                value && setShape(value as Photo['shape'])
                            }
                        >
                            <ToggleGroupItem value="round">
                                Round
                            </ToggleGroupItem>
                            <ToggleGroupItem value="square">
                                Square
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={save} disabled={saving || !area}>
                        Use photo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
