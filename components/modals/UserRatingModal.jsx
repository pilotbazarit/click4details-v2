import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserService from "@/services/UserService";
import toast from "react-hot-toast";

const MAX_RATING = 10;

const normalizeRatingValue = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(MAX_RATING, Math.max(0, Math.round(numericValue)));
};

const UserRatingModal = ({ open, setOpen, selectedData, onSaved }) => {
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setRating(
      normalizeRatingValue(
        selectedData?.profile?.up_rating ?? selectedData?.up_rating ?? 0
      )
    );
    setDescription(
      String(
        selectedData?.profile?.up_rating_description ??
          selectedData?.up_rating_description ??
          ""
      )
    );
  }, [open, selectedData]);

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);

    if (!isOpen) {
      setRating(0);
      setDescription("");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedData?.id) {
      toast.error("User not selected.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await UserService.Commands.updateUser(selectedData.id, {
        _method: "PUT",
        up_rating: rating,
        up_rating_description: description,
      });

      if (response?.status === "success") {
        toast.success("User rating updated successfully!");
        onSaved?.({
          up_rating: rating,
          up_rating_description: description,
        });
        handleOpenChange(false);
        return;
      }

      toast.error(response?.message || "Failed to update user rating.");
    } catch (error) {
      toast.error(error?.message || "Failed to update user rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            User Rating
            {selectedData?.name ? ` - ${selectedData.name}` : ""}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="user-rating-value">
              Rating <span className="text-red-600">
                 ({rating ? rating : 0} Out of 10)
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: MAX_RATING }, (_, index) => {
                const starValue = index + 1;
                const isActive = starValue <= rating;

                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    className={`rounded-md border p-2 transition-colors ${
                      isActive
                        ? "border-amber-300 bg-amber-50 text-amber-500"
                        : "border-gray-200 bg-white text-gray-300 hover:text-amber-400"
                    }`}
                    title={`Set rating ${starValue}`}
                    aria-label={`Set rating ${starValue}`}
                  >
                    <Star
                      className={`h-5 w-5 ${isActive ? "fill-current" : ""}`}
                    />
                  </button>
                );
              })}
            </div>
            <Input
              id="user-rating-value"
              type="number"
              min="0"
              max={MAX_RATING}
              value={rating}
              onChange={(event) =>
                setRating(normalizeRatingValue(event.target.value))
              }
              className="w-full hidden"
            />
            <p className="text-xs text-gray-500">Maximum rating is 10.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-rating-description">Rating Description</Label>
            <Textarea
              id="user-rating-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Write rating description"
              className="min-h-[120px]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserRatingModal;
